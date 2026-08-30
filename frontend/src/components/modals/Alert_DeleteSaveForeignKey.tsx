"use client";

import React from "react";
import { deleteSave } from "@/shared/functions";
import {AllInterface, CommentInterface, PostInterface} from "@/types/types";


interface Alert_DeleteSaveForeignKeyProps {
    /*OBJECTS*/
    saveToDelete: AllInterface | null;

    /*STATE SETTERS*/
    setPosts: React.Dispatch<React.SetStateAction<PostInterface[]>>;
    setComments: React.Dispatch<React.SetStateAction<CommentInterface[]>>;
    setAlls: React.Dispatch<React.SetStateAction<AllInterface[]>>;
    setErrorMessage: (msg: string) => void;

    /*MODAL BOOLS*/
    setAlert_deleteForeignKeys: (visible: boolean) => void;
}

function Alert_DeleteSaveForeignKey({
                                        saveToDelete,
                                        setPosts,
                                        setComments,
                                        setAlls,
                                        setErrorMessage,
                                        setAlert_deleteForeignKeys,
                                    }: Alert_DeleteSaveForeignKeyProps) {
    return (
        <div className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">
                    The post already has saved comments tied to it.
                </h2>
                <p className="mb-4">Would you like to unsave those comments also?</p>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded-md"
                        onClick={() => setAlert_deleteForeignKeys(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                        onClick={() => {
                            if (saveToDelete !== null) {
                                deleteSave(
                                    saveToDelete.id,
                                    "post",
                                    setPosts,
                                    setComments,
                                    setAlls,
                                    setErrorMessage,
                                    setAlert_deleteForeignKeys,
                                    "true"
                                );
                                setAlert_deleteForeignKeys(false);
                            }
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Alert_DeleteSaveForeignKey;