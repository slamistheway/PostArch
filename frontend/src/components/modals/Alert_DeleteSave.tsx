"use client";

import React from "react";
import { deleteSave } from "@/shared/functions";
import {AllInterface, CommentInterface, PostInterface} from "@/types/types";

interface Alert_DeleteSaveProps {
    /*OBJECTS*/
    saveToDelete: AllInterface | null;

    /*STATE SETTERS*/
    setPosts: React.Dispatch<React.SetStateAction<PostInterface[]>>;
    setComments: React.Dispatch<React.SetStateAction<CommentInterface[]>>;
    setAlls: React.Dispatch<React.SetStateAction<AllInterface[]>>;
    setErrorMessage: (msg: string) => void;

    /*MODAL BOOLS*/
    setAlert_deleteSave: (visible: boolean) => void;
    setAlert_deleteForeignKeys: (visible: boolean) => void;
}

function Alert_DeleteSave({
                              saveToDelete,
                              setPosts,
                              setComments,
                              setAlls,
                              setErrorMessage,
                              setAlert_deleteSave,
                              setAlert_deleteForeignKeys,
                          }: Alert_DeleteSaveProps) {
    return (
        <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Delete Save</h2>
                <p className="mb-4">Are you sure you want to delete this save?</p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-md"
                        onClick={() => setAlert_deleteSave(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                        onClick={() => {
                            console.log("does all exist:", saveToDelete !== null);
                            if (saveToDelete !== null) {
                                deleteSave(
                                    saveToDelete.id,
                                    saveToDelete.title ? "post" : "comment",
                                    setPosts,
                                    setComments,
                                    setAlls,
                                    setErrorMessage,
                                    setAlert_deleteForeignKeys
                                );
                            }
                            setAlert_deleteSave(false);
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Alert_DeleteSave;