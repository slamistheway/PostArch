'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MainSidePanel from '@/components/Main-side-panel';
import OptionsSections from "@/components/Options-sections";
import '../app/globals.css'
import {FaComment, FaImage, FaEllipsis, FaPen, FaTrash, FaMapPin, FaPlus, FaThumbtackSlash,} from 'react-icons/fa6';
import { PostInterface, CommentInterface, ListInterface, AllInterface } from '@/types/types';
import {pinSave, deleteSave, addSaveToList} from "@/shared/functions";
import { truncate } from '@/shared/functions';
import {FaList, FaThumbtack, FaTimes} from "react-icons/fa";
import {router} from "next/client";
import PostCard from "@/components/PostCard";
import CommentCard from "@/components/CommentCard";
import Alert_DeleteSaveForeignKey from "@/components/modals/Alert_DeleteSaveForeignKey";
import Alert_DeleteSave from "@/components/modals/Alert_DeleteSave";










export default function Saves() {
  const [isVisibleCreateListPanel, setIsVisibleCreateListPanel] = useState(false);
  const [isVisiblePostPanel, setIsVisiblePostPanel] = useState(false);

  /*----------FOR PASSING INTO COMPONENTS----------*/
  /*OBJECTS*/
  const [saveToDelete, setSaveToDelete] = useState<AllInterface | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<CommentInterface | null>(null);
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [comments, setComments] = useState<CommentInterface[]>([]);
  const [alls, setAlls] = useState<AllInterface[]>([]);
  const [lists, setLists] = useState<ListInterface[]>([]);
  const [listName, setListName] = useState('');
  const [pinnedIDs, setPinnedIDs] = useState<string[]>([]);
  const [arrayOfPostsWithTheirLists, setArrayOfPostsWithTheirLists] =
      useState<
          {
            postId: string;
            listIds: number[];
          }[]
      >([]);
  /*LOG STRINGS*/
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /*MODAL BOOLS*/
  const [alert_deleteSave, setAlert_deleteSave] = useState(false);
  const [alert_deleteForeignKeys, setAlert_deleteForeignKeys] = useState(false);
  const [isVisibleMoreOptionsPanelId, setIsVisibleMoreOptionsPanelId] = useState<string | null>(null);
  const [isVisibleAddToListPanelId, setIsVisibleAddToListPanelId] = useState<string | null>(null);



  useEffect(() => {
    const fetchMain = async () => {
      try {
        const [listsRes, postsRes, commentsRes, pinnedRes] = await Promise.all([
          fetch(`http://localhost:3001/scrapper/lists`),
          fetch(`http://localhost:3001/scrapper/posts?pageType=savesPage`),
          fetch(`http://localhost:3001/scrapper/comments?pageType=savesPage`),
          fetch(`http://localhost:3001/scrapper/pinnedIDs`),
        ]);

        const failed = [listsRes, postsRes, commentsRes, pinnedRes].find((r) => !r.ok);
        if (failed) {
          const errBody = await failed.json().catch(() => ({}));
          throw new Error(errBody?.message ?? 'Failed to load something of saves.');
        }

        const listsData: ListInterface[] = await listsRes.json();
        const postsData: PostInterface[] = await postsRes.json();
        const commentsData: CommentInterface[] = await commentsRes.json();
        const pinnedData: string[] = await pinnedRes.json();

        setLists(listsData ?? []);
        setPosts(postsData ?? []);
        setComments(commentsData ?? []);
        setPinnedIDs(pinnedData ?? []);

        // strictly after fetchMain's data is in hand — not racing it
        await fetchListsInPosts(listsData, postsData);
      } catch (err: any) {
        setErrorMessage(err?.message ?? 'Failed to load saves.');
      }
    };

    const fetchListsInPosts = async (
        listsData: ListInterface[],
        postsData: PostInterface[]
    ) => {
      try {
        const listIDs = listsData.map((list) => list.id);
        const postIDs = postsData.map((post) => post.id);

        const res = await fetch(`http://localhost:3001/scrapper/loadAllPostsAndFetchTheirLists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arg_postIDs: postIDs }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody?.message ?? 'Failed to check lists for posts.');
        }

        const data: { postId: string, listIds: number[] }[] = await res.json();
        setArrayOfPostsWithTheirLists(data ?? []);
        console.log(data);
      } catch (err: any) {
        setErrorMessage(err?.message ?? 'Failed to check lists for posts.');
      }
    };


    fetchMain();
  }, []);


  const openOrCloseCreateListPanel = () => {
    setIsVisibleCreateListPanel((prev) => !prev);
  };

  const openOrCloseMoreOptionsSavePanel = (id: string) => {
    setIsVisibleMoreOptionsPanelId((prev) => (prev === id ? null : id));
  };

  const onOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      openOrCloseCreateListPanel();
    }
  };

  const onKeyDownEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisibleCreateListPanel(false);
      setIsVisiblePostPanel(false);
    }
  };

  const createList = async () => {
    if (!listName) {
      setErrorMessage('Please enter a list name.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/scrapper/createList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arg_ListName: listName }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.message ?? 'Stvaranje liste nije uspjelo.');
      }

      const newList: ListInterface = await res.json();
      setErrorMessage('');
      setIsVisibleCreateListPanel(false);
      setLists((prev) => [...prev, newList]);
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Stvaranje liste nije uspjelo.');
    }
  };


  const seeIfEachListHasPostID = async (arg_ListID: string[], arg_postID: string) => {
    try {
      const res = await fetch(`http://localhost:3001/scrapper/seeIfEachListHasPostID`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({arg_ListID, arg_postID }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.message ?? 'Provjera objave u listi nije uspjela.');
      }

      return res;

    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Spremanje u listu nije uspjelo.');
    }
  }


  return (
    <div className="bg-[url('/bamboo.png')] bg-cover bg-center h-screen">
      <Navbar />

      <div className="mx-[10vw] p-5" onKeyDown={onKeyDownEscape}>
        <div className="flex flex-col gap-4">
          <div className="flex gap-6">
            <aside className="w-1/7">
              <MainSidePanel />
            </aside>

            <main className="w-6/7 flex flex-col gap-4">
              {/* --------------------------------------------- OPTIONS --------------------------------------------- */}
              <OptionsSections />

              {/* --------------------------------------------- LISTS --------------------------------------------- */}
              <section className="relative overflow-hidden px-3 py-1 rounded-3xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
                {/* Top gloss */}
                <div className="absolute top-0 left-0 w-full h-1/3 rounded-t-3xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" ></div>
                {/* Bottom gloss */}
                <div className="absolute bottom-0 left-0 w-full h-[90%] rounded-t-[20%] bg-gradient-to-t from-black/35 via-black/15 to-transparent pointer-events-none"></div>

                {/* SECTION HEADER */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 h-8">
                    <img src="/icons/list.png" alt="lists-icon" className="h-full w-auto" />
                    <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">
                      Lists
                    </h1>
                  </div>
                  <Link href="/saves/lists" className="underline">
                    See more
                  </Link>
                </div>


                <div className="grid grid-cols-7 auto-rows-[110px] gap-4 p-2">
                  <button onClick={openOrCloseCreateListPanel} className="flex flex-col justify-center p-2 bg-gradient-to-b from-white/80 to-transparent text-center rounded-2xl shadow-xl">
                    <img src="/icons/add.png" alt="create-list-icon" className="w-[50%] h-auto mx-auto" />
                    <span>New list</span>
                  </button>

                  {lists.slice(0, 6).map((list) => (
                      <Link
                          key={list.id}
                          href={`/saves/lists/${list.id}`}
                          className="flex flex-col justify-center p-2 bg-gradient-to-b from-white/80 to-transparent text-center rounded-2xl shadow-xl"
                      >
                        <img
                            src="/icons/list.png"
                            alt="lists-icon"
                            className="w-[50%] h-auto mx-auto"
                        />
                        <p>{list.name}</p>
                      </Link>
                  ))}
                </div>

                {errorMessage && <p className="text-red-500">{errorMessage}</p>}

              </section>


              {/* --------------------------------------------- POSTS --------------------------------------------- */}
              <section className="relative z-20 rounded-3xl border border-white/40 bg-white/30 px-3 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                {/* Top gloss */}
                <div className="pointer-events-none absolute left-0 top-0 h-1/3 w-full rounded-t-3xl bg-gradient-to-b from-white/30 to-transparent" />
                {/* Bottom gloss */}
                <div className="pointer-events-none absolute bottom-0 left-0 h-[90%] w-full rounded-t-[20%] bg-gradient-to-t from-black/35 via-black/15 to-transparent" />

                {/* SECTION HEADER */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 h-8">
                    <img src="/icons/posts.png" alt="posts-icon" className="h-full w-auto" />
                    <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">
                      Posts
                    </h1>
                  </div>
                  <Link href="/saves/posts" className="underline">
                    See more
                  </Link>
                </div>

                {/* Error */}
                {errorMessage && (<p className="relative text-red-500">{errorMessage}</p>)}

                {/* Posts Grid */}
                <PostCard
                    setSaveToDelete={setSaveToDelete}
                    posts={posts}
                    lists={lists}
                    pinnedIDs={pinnedIDs}
                    arrayOfPostsWithTheirLists={arrayOfPostsWithTheirLists}
                    setArrayOfPostsWithTheirLists={setArrayOfPostsWithTheirLists}
                    isVisibleAddToListPanelId={isVisibleAddToListPanelId}
                    isVisibleMoreOptionsPanelId={isVisibleMoreOptionsPanelId}
                    openOrCloseMoreOptionsSavePanel={openOrCloseMoreOptionsSavePanel}
                    setIsVisibleAddToListPanelId={setIsVisibleAddToListPanelId}
                    setPinnedIDs={setPinnedIDs}
                    setErrorMessage={setErrorMessage}
                    setAlert_deleteSave={setAlert_deleteSave}
                    setAlert_deleteForeignKeys={setAlert_deleteForeignKeys}
                />
              </section>



              {/* --------------------------------------------- COMMENTS --------------------------------------------- */}
              <section className="relative z-19 rounded-3xl border border-white/40 bg-white/30 px-3 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                {/* Top gloss */}
                <div className="pointer-events-none absolute left-0 top-0 h-1/3 w-full rounded-t-3xl bg-gradient-to-b from-white/30 to-transparent" />
                {/* Bottom gloss */}
                <div className="pointer-events-none absolute bottom-0 left-0 h-[90%] w-full rounded-t-[20%] bg-gradient-to-t from-black/35 via-black/15 to-transparent" />

                {/* SECTION HEADER */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 h-8">
                    <img src="/icons/comments.png" alt="comments-icon" className="h-full w-auto" />
                    <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">
                      Comments
                    </h1>
                  </div>
                  <Link href="/saves/comments" className="underline">
                    See more
                  </Link>
                </div>


                {/* Error */}
                {errorMessage && (<p className="relative text-red-500">{errorMessage}</p>)}

                {/* Comments Grid */}
                <CommentCard
                    setSaveToDelete={setSaveToDelete}
                    comments={comments}
                    lists={lists}
                    pinnedIDs={pinnedIDs}
                    isVisibleAddToListPanelId={isVisibleAddToListPanelId}
                    isVisibleMoreOptionsPanelId={isVisibleMoreOptionsPanelId}
                    openOrCloseMoreOptionsSavePanel={openOrCloseMoreOptionsSavePanel}
                    setIsVisibleAddToListPanelId={setIsVisibleAddToListPanelId}
                    setPinnedIDs={setPinnedIDs}
                    setErrorMessage={setErrorMessage}
                    setAlert_deleteSave={setAlert_deleteSave}
                />
              </section>
            </main>
          </div>
        </div>
      </div>






      {/* ---------------------------------------------MODALS--------------------------------------------- */}
      {isVisibleCreateListPanel && (
        <div onClick={onOverlayClick} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold">Create list</h2>

            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="List name"
              className="w-full rounded-lg border border-gray-300 p-2.5 outline-none"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsVisibleCreateListPanel(false)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={createList}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}


      {alert_deleteSave && (
          <Alert_DeleteSave
              saveToDelete={saveToDelete}
              setPosts={setPosts}
              setComments={setComments}
              setAlls={setAlls}
              setErrorMessage={setErrorMessage}
              setAlert_deleteSave={setAlert_deleteSave}
              setAlert_deleteForeignKeys={setAlert_deleteForeignKeys}
          />
      )}

      {alert_deleteForeignKeys && (
          <Alert_DeleteSaveForeignKey
              saveToDelete={saveToDelete}
              setPosts={setPosts}
              setComments={setComments}
              setAlls={setAlls}
              setErrorMessage={setErrorMessage}
              setAlert_deleteForeignKeys={setAlert_deleteForeignKeys}
          />
      )}


    </div>
  );
}
