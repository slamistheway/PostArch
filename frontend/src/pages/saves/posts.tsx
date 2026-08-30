'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MainSidePanel from '@/components/Main-side-panel';
import OptionsSection from '@/components/Options-sections';
import FiltersSection from '@/components/Filters-section';
import {FaComment, FaImage, FaEllipsis, FaPen, FaTrash, FaMapPin, FaPlus,} from 'react-icons/fa6';
import '../../app/globals.css';
import { PostInterface, CommentInterface, ListInterface, AllInterface } from '@/types/types';
import {pinSave} from "@/shared/functions";
import { truncate } from '@/shared/functions';
import PostCard from "@/components/PostCard";
import Alert_DeleteSave from "@/components/modals/Alert_DeleteSave";
import Alert_DeleteSaveForeignKey from "@/components/modals/Alert_DeleteSaveForeignKey";




function getPostImagePath(arg: string): string {
  return `http://localhost:3001/${arg}`;
}

export default function Posts() {
  const [isVisibleCreateListPanel, setIsVisibleCreateListPanel] = useState(false);
  const [isVisiblePostPanel, setIsVisiblePostPanel] = useState(false);

  /*----------FOR PASSING INTO COMPONENTS----------*/
  /*OBJECTS*/
  const [saveToDelete, setSaveToDelete] = useState<AllInterface | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<CommentInterface | null>(null);
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [alls, setAlls] = useState<AllInterface[]>([]);
  const [comments, setComments] = useState<CommentInterface[]>([]);
  const [lists, setLists] = useState<ListInterface[]>([]);
  const [listName, setListName] = useState('');
  const [pinnedIDs, setPinnedIDs] = useState<string[]>([]);
  /*LOG STRINGS*/
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /*MODAL BOOLS*/
  const [alert_deleteSave, setAlert_deleteSave] = useState(false);
  const [alert_deleteForeignKeys, setAlert_deleteForeignKeys] = useState(false);
  const [isVisibleMoreOptionsPanelId, setIsVisibleMoreOptionsPanelId] = useState<string | null>(null);
  const [isVisibleAddToListPanelId, setIsVisibleAddToListPanelId] = useState<string | null>(null);


  /*dovrsi ovu varijab*/
  const [arrayOfListsWithThatPostID, setArrayOfListsWithThatPostID] = useState<{ listId: string; postId: string }[]>([]);


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [postsRes, listsRes, pinnedRes] = await Promise.all([
          fetch(`http://localhost:3001/scrapper/posts`),
          fetch(`http://localhost:3001/scrapper/lists`),
          fetch(`http://localhost:3001/scrapper/pinnedIDs`),
        ]);

        const failed = [postsRes, listsRes, pinnedRes].find((r) => !r.ok);
        if (failed) {
          const errBody = await failed.json().catch(() => ({}));
          throw new Error(errBody?.message ?? 'Failed to load saves.');
        }

        const postsData: PostInterface[] = await postsRes.json();
        const listsData: ListInterface[] = await listsRes.json();
        const pinnedData: string[] = await pinnedRes.json();
        setPosts(postsData ?? []);
        setLists(listsData ?? []);
        setPinnedIDs(pinnedData ?? []);
      } catch (err: any) {
        setErrorMessage(err?.message ?? 'Failed to load posts.');
      }
    };

    fetchPosts();
  }, []);

  const onKeyDownEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
        //asdas
    }
  };

  const openOrCloseMoreOptionsSavePanel = (id: string) => {
    setIsVisibleMoreOptionsPanelId((prev) => (prev === id ? null : id));
  };


  const addSaveToList = async (arg_ListID: string, arg_SaveID: string, arg_postType: string) => {
    try {
      const res = await fetch(`http://localhost:3001/scrapper/addSaveToList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({arg_ListID, arg_SaveID, arg_postType }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.message ?? 'Dodavanje sačuvanog sadržaja u listu nije uspjelo.');
      }

      const data: { message: string } = await res.json();
      console.log(data.message);
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Spremanje u listu nije uspjelo.');
    }
  };




  return (
    <div className="bg-[url('/bamboo.png')] bg-cover bg-center min-h-screen">
      <Navbar />

      <div className="mx-[10vw] p-5" onKeyDown={onKeyDownEscape}>
        <div className="flex flex-col gap-4">
          <div className="flex gap-6">
            <aside className="w-1/7">
              <MainSidePanel />
            </aside>

            <main className="w-6/7 flex flex-col gap-4">
              {/* --------------------------------------------- OPTIONS --------------------------------------------- */}
              <OptionsSection />

              {/* --------------------------------------------- FILTERS --------------------------------------------- */}
              <FiltersSection />

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
                </div>

                {/* Error */}
                {errorMessage && (<p className="relative text-red-500">{errorMessage}</p>)}

                {/* Posts Grid */}
                <PostCard
                    setSaveToDelete={setSaveToDelete}
                    posts={posts}
                    lists={lists}
                    pinnedIDs={pinnedIDs}
                    isVisibleAddToListPanelId={isVisibleAddToListPanelId}
                    isVisibleMoreOptionsPanelId={isVisibleMoreOptionsPanelId}
                    openOrCloseMoreOptionsSavePanel={openOrCloseMoreOptionsSavePanel}
                    setIsVisibleAddToListPanelId={setIsVisibleAddToListPanelId}
                    setPinnedIDs={setPinnedIDs}
                    setErrorMessage={setErrorMessage}
                    setAlert_deleteSave={setAlert_deleteSave}
                    setAlert_deleteForeignKeys={setAlert_deleteForeignKeys}
                    setArrayOfListsWithThatPostID={setArrayOfListsWithThatPostID}
                />
              </section>


            </main>
          </div>
        </div>
      </div>





      {/* ---------------------------------------------MODALS--------------------------------------------- */}
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
