import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "node:path";
import * as fs from "node:fs";
import { randomUUID } from "node:crypto";
import {spawn} from "node:child_process";
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from '../db/schema';
import { and, count, desc, eq, inArray, isNotNull } from 'drizzle-orm';

const posts = schema.posts;
const comments = schema.comments;
const lists = schema.lists;
const list_posts = schema.list_posts;
const list_comments = schema.list_comments;
const pinned = schema.pinned;


interface ExtractedPostDetails {
  id?: string;
  title?: string;
  content: string;
  author?: string;
  url?: string;
  subreddit?: string;
  imageUrl: string | null;
}

type PostRow = typeof schema.posts.$inferSelect;
type CommentRow = typeof schema.comments.$inferSelect;

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);

  constructor(
      @Inject('DRIZZLE_DB') private db: NodePgDatabase<typeof schema>,
  ) {}





  /*---------------------------------------------------------------------FUNKCIJE--------------------------------------------------------------------------*/

  private async savePostImage(imageUrl: string, postId: string): Promise<string> {
    const imageDir = path.join(process.cwd(), 'public', 'post_images');
    await fs.promises.mkdir(imageDir, { recursive: true });

    const parsedImageUrl = new URL(imageUrl, 'https://www.reddit.com');
    const response = await fetch(parsedImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch post image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    const extensionFromUrl = path.extname(parsedImageUrl.pathname);
    const extensionFromType = contentType.includes('png')
      ? '.png'
      : contentType.includes('jpeg') || contentType.includes('jpg')
        ? '.jpg'
        : contentType.includes('webp')
          ? '.webp'
          : contentType.includes('gif')
            ? '.gif'
            : '.jpg';
    const fileName = `${this.buildFileNameFromText(postId)}-${randomUUID()}${extensionFromUrl || extensionFromType}`;
    const filePath = path.join(imageDir, fileName);
    const relativePath = path.posix.join('post_images', fileName);
    const buffer = Buffer.from(await response.arrayBuffer());

    await fs.promises.writeFile(filePath, buffer);
    this.logger.log(`Saved post image to ${filePath}`);

    return relativePath;
  }

  private buildFileNameFromUrl(parsedUrl: URL): string {
    const baseName = [parsedUrl.hostname, ...parsedUrl.pathname.split('/').filter(Boolean)]
        .join('-')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return baseName || 'page';
  }

  private buildFileNameFromText(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'post';
  }






  /*---------------------------------------------------------------------CREATE--------------------------------------------------------------------------*/
  async addSaveYTDLP(arg_URL: string): Promise<string> {
    const path_to_py_script = path.join(__dirname, '../../src/yt-dlp/script.py');
    if (!fs.existsSync(path_to_py_script)) {
      throw new NotFoundException(`Python script not found at ${path_to_py_script}`);
    }

    return new Promise((resolve, reject) => {
      const process = spawn("py", [
        path_to_py_script,
        arg_URL,
      ]);

      let output = "";
      let error = "";

      process.stdout.on("data", (data) => {
        this.logger.warn(`Python output: ${data.toString()}`);
        output += data.toString();
      });

      process.stderr.on("data", (data) => {
        this.logger.warn(`Python error: ${data.toString()}`);
        error += data.toString();
      });

      process.on("error", (err) => {
        this.logger.warn(`Python error: ${err.message}`);
        reject(err);
      });

      process.on("close", (code) => {
        if (code === 0) {
          this.logger.warn(`Python output on close: ${output.toString()}`);
          resolve(output);
        } else {
          this.logger.warn(`Python error: ${error.toString()}`);
          reject(new Error(error || `Python exited with code ${code}`));
        }

        fs.rm('../../Youaintno', { recursive:true }, (err) => {
          if(err){
            this.logger.error(err.message);
            return;
          }
          this.logger.log("File deleted successfully");
        })

      });


    });
  }





  async addSaveToList(arg_ListID: string, arg_SaveID: string, arg_postType: string) {
    this.logger.debug(`Adding save to list: ${arg_ListID}, ${arg_SaveID}, ${arg_postType}`);

    if (!arg_SaveID || !arg_ListID || !arg_postType) {
      throw new NotFoundException('Save ID, List ID and Post type are required.');
    }

    try {
      if (arg_postType === 'post') {
        await this.db.insert(schema.list_posts).values({ list_id: Number(arg_ListID), post_id: arg_SaveID });
      }else if(arg_postType === 'comment'){
        await this.db.insert(schema.list_comments).values({ list_id: Number(arg_ListID), comment_id: arg_SaveID });
      }

      return {
        message: 'Save successfully added to list.',
      };
    } catch (error) {
      throw new BadRequestException('Failed to add save to list: ' + error.message);
    }
  }

  async removeSaveFromList(arg_ListID: string, arg_SaveID: string, arg_postType: string) {
    if (!arg_SaveID || !arg_ListID || !arg_postType) {
      throw new NotFoundException('Save ID, List ID and Post type are required.');
    }

    try {
      if (arg_postType === 'post') {
        await this.db.delete(list_posts)
          .where(
              and(
                  eq(list_posts.list_id, Number(arg_ListID)),
                  eq(list_posts.post_id, arg_SaveID),
              )
          );
      } else if (arg_postType === 'comment') {
        await this.db.delete(list_comments)
          .where(
              and(
                  eq(list_comments.list_id, Number(arg_ListID)),
                  eq(list_comments.comment_id, arg_SaveID),
              ),
          );
      }

      return {
        message: 'Save successfully removed from list.',
      };
    } catch (error) {
      throw new BadRequestException('Failed to remove save from list: ' + error.message);
    }
  }




  async createList(arg_ListName: string) {
    if (!arg_ListName) {
      throw new NotFoundException('List name is required.');
    }

    try {
      await this.db.insert(lists)
          .values({ name: arg_ListName });

      this.logger.log('List created successfully: ' + arg_ListName);
      return await this.db.select().from(lists).where(eq(lists.name, arg_ListName));
    } catch (error) {
      throw new BadRequestException('Failed to create list: ' + error.message);
    }
  }

  async pinSave(arg_SaveID: string, isPostOrComment: string): Promise<{ message: string }> {
    if (!arg_SaveID) {
      throw new NotFoundException('Save ID is required.');
    }

    try {
      if (isPostOrComment === 'post') {
        const [foundPin] = await this.db.select().from(pinned).where(eq(pinned.post_id, arg_SaveID)).limit(1);
        if (foundPin) {
          await this.db.delete(pinned).where(eq(pinned.post_id, arg_SaveID));
          return {
            message: 'Post is unpinned',
          };
        }

        const [pinCount] = await this.db.select({ value: count() }).from(pinned);
        if (Number(pinCount?.value ?? 0) > 3) {
          return {
            message: 'Maximum number of pins reached',
          };
        }

        await this.db.insert(pinned).values({ post_id: arg_SaveID });

        return {
          message: 'Post pinned successfully',
        };
      }

      if (isPostOrComment === 'comment') {
        const [foundPin] = await this.db.select().from(pinned).where(eq(pinned.comment_id, arg_SaveID)).limit(1);
        if (foundPin) {
          await this.db.delete(pinned).where(eq(pinned.comment_id, arg_SaveID));
          return {
            message: 'Comment is already pinned',
          };
        }

        const [pinCount] = await this.db.select({ value: count() }).from(pinned);
        if (Number(pinCount?.value ?? 0) > 3) {
          return {
            message: 'Maximum number of pins reached',
          };
        }

        await this.db.insert(pinned).values({ comment_id: arg_SaveID });

        return {
          message: 'Comment pinned successfully',
        };
      }

      throw new BadRequestException(
          'isPostOrComment must be either "post" or "comment".',
      );
    } catch (error) {
      throw new BadRequestException(
          'Failed to pin save: ' + error.message,
      );
    }
  }


  async saveHTMLToFile(arg_URL: string): Promise<string> {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(arg_URL);
    } catch {
      throw new BadRequestException('Invalid URL.');
    }

    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({ headless: true });


    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'User-Agent': 'MyTestApp/0.1 by u/username',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      });
      await page.setViewport({ width: 1200, height: 800 });
      await page.goto(arg_URL, {waitUntil: 'domcontentloaded', timeout: 30000,});


      const dir = path.join(process.cwd(), 'public/post_images');

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const screenshotDir = path.join(dir, 'screenshots');
      if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

      // Take periodic HTML snapshots and screenshots: every 3s for 6s (captures at 0s, 3s, 6s)
      const intervalMs = 3000;
      const durationMs = 6000;
      const count = Math.floor(durationMs / intervalMs) + 1; // 3 captures
      let lastFilePath = '';

      for (let i = 0; i < count; i++) {
        const timestamp = Date.now();
        const base = `${this.buildFileNameFromUrl(parsedUrl)}-snapshot-${i}`;
        try {
          const html = await page.content();
          const fileName = `${base}-${timestamp}.html`;
          const filePath = path.join(dir, fileName);
          fs.writeFileSync(filePath, html, 'utf-8');
          this.logger.log(`Saved HTML snapshot to ${filePath}`);
          lastFilePath = filePath;
        } catch (err) {
          this.logger.warn('Failed saving HTML snapshot: ' + String(err));
        }

        try {
          const imgName = `${base}-${timestamp}.png`;
          const imgPath = path.join(screenshotDir, imgName);
          await page.screenshot({ path: imgPath, fullPage: true });
          this.logger.log(`Saved screenshot: ${imgPath}`);
        } catch (err) {
          this.logger.warn('Failed saving screenshot: ' + String(err));
        }

        if (i < count - 1) await new Promise(res => setTimeout(res, intervalMs));
      }

      // Return path of last snapshot saved (or empty string on failure)
      return lastFilePath;
    } finally {
      await browser.close();
    }
  }



  async addSaveREDDIT(arg_URL: string) {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({ headless: true });

    try {
        // Open an initial page but after a short timeout pick the last page that actually rendered
        let page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
        await page.setViewport({ width: 1200, height: 800 });
        await page.goto(arg_URL, { waitUntil: 'networkidle2', timeout: 30000 });

        const pages = await browser.pages();
        if (pages && pages.length > 0) {
          page = pages[pages.length - 1];
        }

      /*---------------------------COMMENT---------------------------*/
      if (arg_URL.includes('/comment/')) {
        this.logger.log("Saving comment...");

        const comment = await page.evaluate(() => {
          const selectedComment = document.querySelector('shreddit-comment[is-highlighted]');
          const postId = selectedComment?.attributes['postid']?.value;
          const commentId = selectedComment?.attributes['thingid']?.value;
          const author = selectedComment?.attributes['author']?.value;
          const content = selectedComment?.querySelector('div[slot="comment"]')?.textContent?.trim();
          const url = "https://www.reddit.com/" + selectedComment?.attributes['permalink']?.value;
          const subreddit = selectedComment?.attributes['permalink']?.value.split('/')[2];
          return { postId, commentId, author, content, url, subreddit };
        }, arg_URL);


        const post = await page.evaluate(() => {
          const post = document.querySelector('shreddit-post');
          const id = post?.attributes['id']?.value;
          const title = post?.attributes['post-title']?.value;
          const content = post?.querySelector('p')?.textContent?.trim() || '';
          const author = post?.attributes['author']?.value;
          const url = post?.attributes['content-href']?.value;
          const subreddit = post?.attributes['subreddit-prefixed-name']?.value.split('/')[1];
          const imageUrl = post?.querySelector('img[id="post-image"]')?.attributes['src']?.value || "";
          return { id, title, content, author, url, subreddit, imageUrl };
        }, arg_URL);


        if (!comment.author) throw new Error('Failed to extract AUTHOR from COMMENT');
        if (!comment.content) throw new Error('Failed to extract CONTENT from COMMENT');
        if (!comment.subreddit) throw new Error('Failed to extract SUBREDDIT from COMMENT');
        if (!comment.postId) throw new Error('Failed to extract POST ID from COMMENT');
        if (!comment.commentId) throw new Error('Failed to extract COMMENT ID from COMMENT');

        if (!post.id) throw new Error('Failed to extract ID from POST');
        if (!post.title) throw new Error('Failed to extract TITLE from POST');
        if (!post.author) throw new Error('Failed to extract AUTHOR from POST');
        if (!post.subreddit) throw new Error('Failed to extract SUBREDDIT from POST');
        if (!post.content && !post.imageUrl) throw new Error('Failed to extract CONTENT or IMAGE from POST');

        const imagePath = !post.content && post.imageUrl ? await this.savePostImage(post.imageUrl, post.id) : null;
        const storedContent = post.content || 'Post is an image';


        const existingComment = await this.db
          .select()
          .from(comments)
          .where(eq(comments.id, comment.commentId))
          .limit(1);

        if (existingComment.length > 0) {
          return {
            status: "alert",
            message: 'Comment is already saved',
            comment_id: "nada",
          };
        }

        await this.db.insert(posts).values({
          id: post.id,
          manual_save: false,
          author: post.author,
          title: post.title,
          content: storedContent,
          image_path: imagePath,
          url: post.url,
          subreddit: post.subreddit,
        });
        await this.db.insert(comments).values({
          id: comment.commentId,
          manual_save: true,
          parent_id: comment.postId,
          post_id: comment.postId,
          author: comment.author,
          content: comment.content,
          url: comment.url,
          subreddit: comment.subreddit,
        });
        this.logger.warn('Comment added successfully (HTML fallback)');
        this.logger.warn('Post added successfully (HTML fallback)');

        return {
          status: "success",
          message: 'Post and comment added successfully',
          title: comment.author,
          content: comment.content,
        };
      /*---------------------------POST---------------------------*/
      }else {
        const post = await page.evaluate(() => {
          const post = document.querySelector('shreddit-post');
          const id = post?.attributes['id']?.value;
          const title = post?.attributes['post-title']?.value;
          const content = post?.querySelector('p')?.textContent?.trim() || '';
          const author = post?.attributes['author']?.value;
          const url = post?.attributes['content-href']?.value;
          const subreddit = post?.attributes['subreddit-prefixed-name']?.value.split('/')[1];
          const imageUrl = post?.querySelector('img[id="post-image"]')?.attributes['src']?.value || "";
          return { id, title, content, author, url, subreddit, imageUrl };
        }, arg_URL);

        if (!post.id) throw new Error('Failed to extract ID from POST');
        if (!post.title) throw new Error('Failed to extract TITLE from POST');
        if (!post.author) throw new Error('Failed to extract AUTHOR from POST');
        if (!post.subreddit) throw new Error('Failed to extract SUBREDDIT from POST');
        if (!post.content && !post.imageUrl) throw new Error('Failed to extract CONTENT or IMAGE from POST');

        const imagePath = !post.content && post.imageUrl ? await this.savePostImage(post.imageUrl, post.id) : null;
        const storedContent = post.content || 'Post is an image';

        const existingPost = await this.db
          .select()
          .from(posts)
          .where(and(eq(posts.id, post.id), eq(posts.manual_save, true)))
          .limit(1);

        if (existingPost.length > 0) {
          this.logger.warn(existingPost[0].id);
          return {
            status: "alert",
            message: 'Post is already saved',
            post_id: post.id,
          };
        }

        await this.db.insert(posts).values({
          id: post.id,
          manual_save: true,
          author: post.author,
          title: post.title,
          content: storedContent,
          image_path: imagePath,
          url: post.url,
          subreddit: post.subreddit,
        });
        this.logger.log('Post added successfully (HTML fallback): ' + post.title);

        return {
          message: 'Post added successfully (HTML fallback)',
          title: post.title,
          content: storedContent,
          post_id: post.id,
        };
      }
    } catch (error) {
      return {
        status: error.status || 'error',
        message: error.message || 'Unknown error'
      };
    } finally {
      await browser.close();
    }
  }











  /*---------------------------------------------------------------------READ--------------------------------------------------------------------------*/

  async findPosts(pageType: string) {
    this.logger.log("pageType: " + pageType);

    const result = pageType === 'savesPage' || pageType === 'homePage'
      ? await this.db.select().from(posts).where(eq(posts.manual_save, true)).orderBy(desc(posts.date_added))
      : await this.db.select().from(posts).orderBy(desc(posts.date_added));

    if (!result) {
      throw new NotFoundException('Objave nije moguće dohvatiti.');
    }

    if (pageType === 'savesPage' || pageType === 'homePage') {
      return result.slice(0, 4);
    } else {
      return result;
    }
  }



  async findComments(pageType: string) {
    const result = pageType === 'savesPage' || pageType === 'homePage'
      ? await this.db.select().from(comments).where(eq(comments.manual_save, true)).orderBy(desc(comments.date_added))
      : await this.db.select().from(comments).orderBy(desc(comments.date_added));

    if (!result) {
      throw new NotFoundException('Komentare nije moguće dohvatiti.');
    }

    if (pageType === 'savesPage' || pageType === 'homePage') {
      return result.slice(0, 4);
    } else {
      return result;
    }
  }

  async findLists() {
    return await this.db.select().from(lists).orderBy(desc(lists.date_added));
  }


  async findAll(pageType: string, listID: string) {
    this.logger.log(`pageType: ${pageType}`);
    this.logger.log(`listID: ${listID}`);

    let postIDs: string[] = [];
    let commentIDs: string[] = [];
    let foundPosts: PostRow[] = [];
    let foundComments: CommentRow[] = [];

    switch (pageType) {
      case 'listPage':
        const postInLists = await this.db
          .select({ postId: list_posts.post_id })
          .from(list_posts)
          .where(eq(list_posts.list_id, Number(listID)));
        const commentInLists = await this.db
          .select({ commentId: list_comments.comment_id })
          .from(list_comments)
          .where(eq(list_comments.list_id, Number(listID)));

        postIDs = postInLists.map((p) => p.postId).filter((id): id is string => Boolean(id));
        commentIDs = commentInLists.map((c) => c.commentId).filter((id): id is string => Boolean(id));

        foundPosts = postIDs.length > 0
          ? await this.db.select().from(posts).where(inArray(posts.id, postIDs)).orderBy(desc(posts.date_added))
          : [];
        foundComments = commentIDs.length > 0
          ? await this.db.select().from(comments).where(inArray(comments.id, commentIDs)).orderBy(desc(comments.date_added))
          : [];
        break;
      default:
        if (pageType === 'savesPage' || pageType === 'homePage') {
          foundPosts = await this.db.select().from(posts).where(eq(posts.manual_save, true)).orderBy(desc(posts.date_added));
          foundComments = await this.db.select().from(comments).where(eq(comments.manual_save, true)).orderBy(desc(comments.date_added));
        } else {
          foundPosts = await this.db.select().from(posts).orderBy(desc(posts.date_added));
          foundComments = await this.db.select().from(comments).orderBy(desc(comments.date_added));
        }
    }

    const results = [...foundPosts, ...foundComments].sort(
        (a, b) => b.date_added.getTime() - a.date_added.getTime(),
    );

    if (pageType === 'savesPage' || pageType === 'homePage') {
      return results.slice(0, 4);
    }

    return results;
  }


  async findPinned() {
    const postIDs = await this.db.select({ post_id: pinned.post_id }).from(pinned).where(isNotNull(pinned.post_id));
    const commentIDs = await this.db.select({ comment_id: pinned.comment_id }).from(pinned).where(isNotNull(pinned.comment_id));
    const pinnedPostIds = postIDs.flatMap((p) => (p.post_id ? [p.post_id] : []));
    const pinnedCommentIds = commentIDs.flatMap((c) => (c.comment_id ? [c.comment_id] : []));

    const foundPosts = pinnedPostIds.length > 0
      ? await this.db.select().from(posts).where(inArray(posts.id, pinnedPostIds)).orderBy(desc(posts.date_added))
      : [];
    const foundComments = pinnedCommentIds.length > 0
      ? await this.db.select().from(comments).where(inArray(comments.id, pinnedCommentIds)).orderBy(desc(comments.date_added))
      : [];

    if (!foundComments || !foundPosts) {
      throw new NotFoundException('Komentare nije moguće dohvatiti.');
    }

    return [...foundPosts, ...foundComments].sort((a, b) => b.date_added.getTime() - a.date_added.getTime());
  }

  async findPinnedIDs() {
    const pinnedRows = await this.db.select().from(pinned);
    return pinnedRows.map((p) => p.post_id).filter((id): id is string => Boolean(id));
  }



  async findOnePost(id: string) {
    const [post] = await this.db.select().from(posts).where(eq(posts.id, id)).limit(1);

    if (!post) throw new NotFoundException('Objava nije pronađena.');

    return post;
  }


  async findOneComment(id: string) {
    const [comment] = await this.db.select().from(comments).where(eq(comments.id, id)).limit(1);

    if (!comment) throw new NotFoundException('Komentar nije pronađen.');

    return comment;
  }


  async findOneList(id: number) {
    const [list] = await this.db.select().from(lists).where(eq(lists.id, id)).limit(1);

    if (!list) throw new NotFoundException('Lista nije pronađena.');

    return list;
  }


  async loadAllPostsAndFetchTheirLists(arg_postIDs: string[]) {
    const arrayOfSavesWithTheirLists: {
      postId: string;
      listIds: number[];
    }[] = [];

    const saves = arg_postIDs.length > 0
      ? await this.db.select().from(posts).where(inArray(posts.id, arg_postIDs))
      : [];

    for (const save of saves) {
      const listsOfThatSave = await this.db
        .select({ listId: list_posts.list_id })
        .from(list_posts)
        .where(eq(list_posts.post_id, save.id));

      arrayOfSavesWithTheirLists.push({
        postId: save.id,
        listIds: listsOfThatSave.map((list) => list.listId),
      });
    }

    this.logger.log(arrayOfSavesWithTheirLists);

    return arrayOfSavesWithTheirLists;
  }




  /*---------------------------------------------------------------------UPDATE--------------------------------------------------------------------------*/









  /*---------------------------------------------------------------------DELETE--------------------------------------------------------------------------*/

  async deleteSave(arg_SaveID: string, arg_saveType: string, arg_withCommentsAlso?: string): Promise<{ message: string }> {
    try {
      this.logger.warn(`Args: ${arg_SaveID}, ${arg_saveType}, ${arg_withCommentsAlso}`);
      const commentsWithDeletedPostID = await this.db.select().from(comments).where(eq(comments.post_id, arg_SaveID));

      if (arg_withCommentsAlso === 'true') {
        await this.db.delete(comments).where(eq(comments.post_id, arg_SaveID));
        await this.db.delete(posts).where(eq(posts.id, arg_SaveID));

        return {
          message: `${arg_saveType} deleted successfully`,
        };
      }

      if (arg_saveType === 'post' && commentsWithDeletedPostID.length > 0) {
        this.logger.warn(`Returning message`);
        return {
          message: `The post already has saved comments tied to it`
        };
      } else if (arg_saveType === 'post' && commentsWithDeletedPostID.length === 0) {
        this.logger.warn(`Deleting post ${arg_saveType} with ID: ${arg_SaveID}`);
        await this.db.delete(posts).where(eq(posts.id, arg_SaveID));
      }
      else {
        this.logger.error(`Deleting comment ${arg_saveType} with ID: ${arg_SaveID}`);
        await this.db.delete(comments).where(eq(comments.id, arg_SaveID));
      }


      return {
        message: `${arg_saveType} deleted successfully`,
      };
    } catch (error) {
      return {
        message: `${arg_saveType} FAILED to unsave: ${error.message}`,
      };
    }
  }

  async deleteList(arg_ListID: string): Promise<{ message: string }> {
    try {
      await this.db.delete(lists).where(eq(lists.id, Number(arg_ListID)));
      return {
        message: 'List deleted successfully',
      };
    } catch (error) {
      return {
        message: 'FAILED to delete list',
      };
    }
  }



}
