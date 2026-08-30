"use client";

import Link from "next/link";
import {
    FaImage,
    FaEllipsis,
    FaTrash,
    FaPlus,
    FaThumbtackSlash, FaComment,
} from "react-icons/fa6";
import { FaList, FaThumbtack } from "react-icons/fa";
import {addSaveToList, pinSave, truncate} from "@/shared/functions";
import React from "react";
import {AllInterface, ListInterface} from "@/types/types";





interface AllCardProps {
    alls: AllInterface[];
    lists: ListInterface[];
    pinnedIDs: string[];
    isVisibleMoreOptionsPanelId: string | null;
    openOrCloseMoreOptionsSavePanel: (id: string) => void;

    isVisibleAddToListPanelId: string | null;
    setIsVisibleAddToListPanelId: React.Dispatch<React.SetStateAction<string | null>>;

    setPinnedIDs: React.Dispatch<React.SetStateAction<string[]>>;
    setErrorMessage: (msg: string) => void;
    setSaveToDelete: (all: AllInterface) => void;
    setAlert_deleteSave: (visible: boolean) => void;
    setAlert_deleteForeignKeys: (visible: boolean) => void;
}

function AllCard({
                     setSaveToDelete, alls, lists, pinnedIDs, isVisibleAddToListPanelId, isVisibleMoreOptionsPanelId, openOrCloseMoreOptionsSavePanel,
                      setIsVisibleAddToListPanelId, setPinnedIDs, setErrorMessage, setAlert_deleteSave}: AllCardProps) {
    return (
      <>
          {/* All Grid */}
          <div className="relative grid auto-rows-[150px] grid-cols-4 gap-4 rounded-b-3xl p-2">
              {alls.map((all) => (
                  <div key={all.id} className="relative flex flex-col rounded-2xl bg-gradient-to-b from-white/80 to-transparent text-center shadow-xl">
                      {/* Post or comment */}
                      {all.title ? (
                          <Link href={`/saves/posts/${all.id}`} className="flex-1 px-2">
                              <div className="mt-1 flex items-center justify-center gap-1 font-bold text-gray-800">
                                  <span>u/{all.author}</span>
                              </div>

                              <h1 className="text-gray-600">
                                  <FaImage className="inline-block mr-2"/>{truncate(all.title)}
                              </h1>
                          </Link>
                      ) : (
                          <Link href={`/saves/comments/${all.id}`} className="flex-1 px-2">
                              <div className="mt-1 flex items-center justify-center gap-1 font-bold text-gray-800">
                                  <span>u/{all.author}</span>
                              </div>

                              <h1 className="text-gray-600">
                                  <FaComment className="inline-block mr-2"/>{truncate(all.content)}
                              </h1>
                          </Link>
                      )}



                      {/* Add to List Panel */}
                      {isVisibleAddToListPanelId === all.id && (
                          <div className="absolute overflow-y-scroll h-57 top-38 left-0 z-99 w-full flex flex-col gap-2 p-2 bg-gray-200 shadow-lg">
                              {lists.map((list) => (
                                  <button
                                      key={list.id}
                                      type="button"
                                      onClick={(event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          addSaveToList(String(list.id), all.id, all.title ? 'post' : 'comment', setErrorMessage);
                                          setIsVisibleAddToListPanelId(null);
                                      }}
                                      className="flex items-center gap-1 rounded p-2 text-sm text-gray-700 hover:bg-gray-300"
                                  >
                                      <FaList />
                                      <span>{list.name}</span>
                                  </button>
                              ))}
                          </div>
                      )}

                      {/* MORE OPTIONS PANEL */}
                      <div className="flex items-end">
                          {isVisibleMoreOptionsPanelId === all.id ? (
                              <div className="flex w-full rounded-xl bg-gray-200 shadow-lg">
                                  <button
                                      type="button"
                                      onClick={(event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          openOrCloseMoreOptionsSavePanel(all.id);
                                      }}
                                      className="rounded-lg bg-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-400"
                                  >
                                      <FaEllipsis />
                                  </button>

                                  <div className="flex gap-1 w-full justify-start">
                                      {/* Delete */}
                                      <button
                                          type="button"
                                          onClick={(event) => {
                                              event.preventDefault();
                                              event.stopPropagation();
                                              setSaveToDelete(all);
                                              setAlert_deleteSave(true);
                                          }}
                                          className="flex items-center gap-1 rounded px-2 text-sm text-gray-700 hover:bg-gray-300"
                                      >
                                          <FaTrash />
                                      </button>

                                      {/* Pin / Unpin */}
                                      <button
                                          type="button"
                                          onClick={async (event) => {
                                              event.preventDefault();
                                              event.stopPropagation();

                                              const message = await pinSave(all.id, all.title ? 'post' : 'comment');
                                              if (!message.includes('Maximum')) {
                                                  setPinnedIDs((prev) => {
                                                      const wasPinned = prev.includes(all.id);
                                                      return wasPinned
                                                          ? prev.filter((id) => id !== all.id)
                                                          : [...prev, all.id];
                                                  });
                                              } else {
                                                  setErrorMessage('Maximum number of pinned items reached.');
                                              }
                                          }}
                                          className="flex items-center gap-1 rounded px-2 text-sm text-gray-700 hover:bg-gray-300"
                                      >

                                          {pinnedIDs.indexOf(all.id) !== -1 ? <FaThumbtackSlash /> : <FaThumbtack />}
                                      </button>

                                      {/* Add to List */}
                                      <button
                                          type="button"
                                          onClick={(event) => {
                                              event.preventDefault();
                                              event.stopPropagation();
                                              setIsVisibleAddToListPanelId((prev) => (prev === all.id ? null : all.id));
                                          }}
                                          className="flex items-center gap-1 rounded px-2 text-sm text-gray-700 hover:bg-gray-300"
                                      >
                                          <FaPlus />
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
                                      openOrCloseMoreOptionsSavePanel(all.id);
                                  }}
                                  className="rounded-lg bg-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-400"
                              >
                                  <FaEllipsis />
                              </button>
                          )}
                      </div>
                  </div>
              ))}
          </div>
      </>
  );
}

export default AllCard;
