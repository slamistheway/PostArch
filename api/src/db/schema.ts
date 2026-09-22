import {
  pgTable,
  serial,
  timestamp,
  text,
  integer,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  manual_save: boolean('manual_save').default(false),
  author: text('author').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  image_path: text('image_path'),
  url: text('url').notNull(),
  subreddit: text('subreddit').notNull(),
  date_added: timestamp('date_added').defaultNow().notNull(),
});

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  manual_save: boolean('manual_save').default(false),
  parent_id: text('parent_id').notNull(),
  post_id: text('post_id').notNull(),
  author: text('author').notNull(),
  content: text('content').notNull(),
  url: text('url').notNull(),
  subreddit: text('subreddit').notNull(),
  date_added: timestamp('date_added').defaultNow().notNull(),
});

export const lists = pgTable('lists', {
  id: serial('id').primaryKey(),
  name: text('name').default(''),
  date_added: timestamp('date_added').defaultNow().notNull(),
});

export const list_posts = pgTable('list_posts', {
    list_id: integer('list_id').notNull(),
    post_id: text('post_id').notNull(),
  },

  (table) => ({
    pk: primaryKey(table.list_id, table.post_id),
  }),
);

export const list_comments = pgTable('list_comments', {
    list_id: integer('list_id').notNull(),
    comment_id: text('comment_id').notNull(),
  },

  (table) => ({
    pk: primaryKey(table.list_id, table.comment_id),
  }),
);

export const pinned = pgTable('pinned', {
  id: serial('id').primaryKey(),
  post_id: text('post_id'),
  comment_id: text('comment_id'),
  date_pinned: timestamp('date_pinned').defaultNow().notNull(),
});
