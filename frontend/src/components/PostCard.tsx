"use client";

import Link from "next/link";
import {
    FaImage,
    FaEllipsis,
    FaTrash,
    FaPlus,
    FaThumbtackSlash,
} from "react-icons/fa6";
import {FaList, FaThumbtack} from "react-icons/fa";
import {addSaveToList, pinSave, removeSaveFromList, truncate} from "@/shared/functions";
import React from "react";
import {AllInterface, CommentInterface, ListInterface, PostInterface} from "@/types/types";



interface PostCardProps {
    posts: PostInterface[],
    lists: ListInterface[],
    pinnedIDs: string[],
    isVisibleMoreOptionsPanelId: string | null,
    openOrCloseMoreOptionsSavePanel: (id: string) => void,
    isVisibleAddToListPanelId: string | null,
    setIsVisibleAddToListPanelId: React.Dispatch<React.SetStateAction<string | null>>,
    arrayOfPostsWithTheirLists: {
        postId: string;
        listIds: number[];
    }[],
    setArrayOfPostsWithTheirLists: React.Dispatch<
        React.SetStateAction<{
            postId: string;
            listIds: number[];
        }[]>>,

    setPinnedIDs: React.Dispatch<React.SetStateAction<string[]>>,
    setErrorMessage: (msg: string) => void,
    setSaveToDelete: (post: PostInterface) => void,
    setAlert_deleteSave: (visible: boolean) => void,
    setAlert_deleteForeignKeys: (visible: boolean) => void,
}

function PostCard({
                      setSaveToDelete,
                      posts,
                      lists,
                      pinnedIDs,
                      arrayOfPostsWithTheirLists,
                      setArrayOfPostsWithTheirLists,
                      isVisibleAddToListPanelId,
                      isVisibleMoreOptionsPanelId,
                      openOrCloseMoreOptionsSavePanel,
                      setIsVisibleAddToListPanelId,
                      setPinnedIDs,
                      setErrorMessage,
                      setAlert_deleteSave,
                      setAlert_deleteForeignKeys
                  }: PostCardProps) {
    return (
        <>
            {/* Posts Grid */}
            <div className="relative grid auto-rows-[150px] grid-cols-4 gap-4 rounded-b-3xl p-2">
                {posts.map((post) => (
                    <div key={post.id}
                         className="relative flex flex-col rounded-2xl bg-gradient-to-b from-white/80 to-transparent text-center shadow-xl">
                        {/* Post */}
                        <Link href={`/saves/posts/${post.id}`} className="flex-1 px-2">
                            <div className="mt-1 flex items-center justify-center gap-1 font-bold text-gray-800">
                                <span>u/{post.author}</span>
                            </div>
                            <h1 className="text-gray-600">
                                <FaImage className="inline-block mr-2"/>
                                {truncate(post.title)}
                            </h1>
                        </Link>


                        {/* Add to List Panel */}
                        {isVisibleAddToListPanelId === post.id && (
                            <div className="absolute overflow-y-scroll h-57 top-38 left-0 z-99 w-full flex flex-col gap-2 p-2 bg-gray-200 shadow-lg">
                                {lists.map((list) => (
                                    arrayOfPostsWithTheirLists.some(
                                        (item) =>
                                            (item.listIds ?? []).includes(Number(list.id)) &&
                                            (item.postId ?? []).includes(String(post.id))
                                    ) ? (
                                        // Already in this list
                                        <button
                                            key={list.id}
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();

                                                removeSaveFromList(
                                                    String(list.id),
                                                    post.id,
                                                    'post',
                                                    setErrorMessage
                                                );

                                                setArrayOfPostsWithTheirLists((prev) => {
                                                    const existingItemIndex = prev.findIndex((item) => item.postId === post.id);
                                                    return prev.map((item, index) => index === existingItemIndex ? {...item, listIds: item.listIds.filter((id) => id !== Number(list.id)),} : item);
                                                });

                                                setIsVisibleAddToListPanelId(null);
                                            }}

                                            className="flex items-center gap-1 rounded p-2 text-sm text-gray-500 bg-gray-200"
                                        >
                                            <FaList />
                                            <span>{list.name} ✓</span>
                                        </button>
                                    ) : (
                                        // Not in this list
                                        <button
                                            key={list.id}
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();

                                                addSaveToList(
                                                    String(list.id),
                                                    post.id,
                                                    'post',
                                                    setErrorMessage
                                                );

                                                setArrayOfPostsWithTheirLists((prev) => {
                                                    const existingItemIndex = prev.findIndex((item) => item.postId === post.id);
                                                    return prev.map((item, index) => index === existingItemIndex ? { ...item, listIds: [...item.listIds, Number(list.id)] } : item);
                                                });

                                                setIsVisibleAddToListPanelId(null);
                                            }}
                                            className="flex items-center gap-1 rounded p-2 text-sm text-gray-700 hover:bg-gray-300 bg-green"
                                        >
                                            <FaList />
                                            <span>{list.name}</span>
                                        </button>
                                    )
                                ))}
                            </div>
                        )}


                        {/* MORE OPTIONS PANEL */}
                        <div className="flex items-end">
                            {isVisibleMoreOptionsPanelId === post.id ? (
                                <div className="flex w-full rounded-xl bg-gray-200 shadow-lg">
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            openOrCloseMoreOptionsSavePanel(post.id);
                                        }}
                                        className="rounded-lg bg-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-400"
                                    >
                                        <FaEllipsis/>
                                    </button>

                                    <div className="flex gap-1 w-full justify-start">
                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                setSaveToDelete(post);
                                                setAlert_deleteSave(true);
                                            }}
                                            className="flex items-center gap-1 rounded px-2 text-sm text-gray-700 hover:bg-gray-300"
                                        >
                                            <FaTrash/>
                                        </button>

                                        {/* Pin / Unpin */}
                                        <button
                                            type="button"
                                            onClick={async (event) => {
                                                event.preventDefault();
                                                event.stopPropagation();

                                                const message = await pinSave(post.id, 'post');
                                                if (!message.includes('Maximum')) {
                                                    setPinnedIDs((prev) => {
                                                        const wasPinned = prev.includes(post.id);
                                                        return wasPinned
                                                            ? prev.filter((id) => id !== post.id)
                                                            : [...prev, post.id];
                                                    });
                                                } else {
                                                    setErrorMessage('Maximum number of pinned items reached.');
                                                }
                                            }}
                                            className="flex items-center gap-1 rounded px-2 text-sm text-gray-700 hover:bg-gray-300"
                                        >

                                            {pinnedIDs.indexOf(post.id) !== -1 ? <FaThumbtackSlash/> : <FaThumbtack/>}
                                        </button>

                                        {/* Add to List */}
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                setIsVisibleAddToListPanelId((prev) => (prev === post.id ? null : post.id));
                                            }}
                                            className="flex items-center gap-1 rounded px-2 text-sm text-gray-700 hover:bg-gray-300"
                                        >
                                            <FaPlus/>
                                            <span>Add to List</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Collapsed options */
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        openOrCloseMoreOptionsSavePanel(post.id);
                                    }}
                                    className="rounded-lg bg-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-400"
                                >
                                    <FaEllipsis/>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default PostCard;
