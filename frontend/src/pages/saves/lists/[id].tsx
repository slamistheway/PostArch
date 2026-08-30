'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {FaEllipsis, FaTrash, FaPen, FaPlus, FaComment, FaMapPin, FaImage} from 'react-icons/fa6';
import {useRouter} from "next/router";
import '../../../app/globals.css';
import Link from "next/link";
import { ListInterface, AllInterface } from '@/types/types';
import {pinSave} from "@/shared/functions";
import AllCard from "@/components/AllCard";
import Alert_DeleteSave from "@/components/modals/Alert_DeleteSave";
import Alert_DeleteSaveForeignKey from "@/components/modals/Alert_DeleteSaveForeignKey";





export default function List() {
    const router = useRouter();
    const listID = router.query.id as string;

    const [list, setList] = useState<ListInterface | null>(null);
    const [alls, setAlls] = useState<AllInterface[]>([]);
    const [lists, setLists] = useState<ListInterface[]>([]);
    const [pinnedIDs, setPinnedIDs] = useState<string[]>([]);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isVisibleMoreOptionsList, setIsVisibleMoreOptionsList] = useState(false);
    const [alert_deleteList, setAlert_deleteList] = useState(false);
    const [isVisibleMoreOptionsPostOrComment, setisVisibleMoreOptionsPostOrComment] = useState<string | null>(null);


    const [isVisibleCreateListPanel, setIsVisibleCreateListPanel] = useState(false);
    const [isVisiblePostPanel, setIsVisiblePostPanel] = useState(false);

    const [isVisibleMoreOptionsPanelId, setIsVisibleMoreOptionsPanelId] = useState<string | null>(null);
    const [isVisibleAddToListPanelId, setIsVisibleAddToListPanelId] = useState<string | null>(null);

    const [alert_deleteSave, setAlert_deleteSave] = useState(false);
    const [alert_deleteForeignKeys, setAlert_deleteForeignKeys] = useState(false);
    const [allToDelete, setAllToDelete] = useState<AllInterface | null>(null);


    useEffect(() => {
        if (!listID) return;

        const fetchList = async () => {
            try {
                const [listViewRes, allRes, pinnedRes, listsRes] = await Promise.all([
                    fetch(`http://localhost:3001/scrapper/listView/${listID}`),
                    fetch(`http://localhost:3001/scrapper/all?pageType=listPage&listID=${listID}`),
                    fetch(`http://localhost:3001/scrapper/pinnedIDs`),
                    fetch(`http://localhost:3001/scrapper/lists`),
                ]);

                const failed = [listViewRes, allRes, pinnedRes, listsRes].find((r) => !r.ok);
                if (failed) {
                    const errBody = await failed.json().catch(() => ({}));
                    throw new Error(errBody?.message ?? 'Failed to load list or saves from list.');
                }
                const listsData: ListInterface[] = await listsRes.json();
                const listViewData: ListInterface = await listViewRes.json();
                const allData: AllInterface[] = await allRes.json();
                const pinnedData: string[] = await pinnedRes.json();
                setList(listViewData ?? null);
                setPinnedIDs(pinnedData ?? []);
                setAlls(allData ?? []);
                setLists(listsData ?? []);
            } catch (err: any) {
                setErrorMessage(err?.message ?? 'Dohvaćanje liste ili njenih objava nije uspjelo.');
            }
        };

        fetchList();
    }, [listID]);



    function truncate(text: string, length = 100) {
        if (!text) return "";
        return text.length > length ? `${text.slice(0, length)}...` : text;
    }
    
    function getPostImagePath(arg: string): string {
        return `http://localhost:3001/${arg}`;
    }


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



    const openMoreOptionsList = () => {
        setIsVisibleMoreOptionsList((prev) => !prev);
    };

    const openOrCloseMoreOptionsSavePanel = (id: string) => {
        setIsVisibleMoreOptionsPanelId((prev) => (prev === id ? null : id));
    };



    const deleteList = async (argID: number) => {
        try {
            const res = await fetch(`http://localhost:3001/scrapper/deleteList/${argID}`, {
                method: 'DELETE',
            });

            console.log(res);

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody?.message ?? 'Brisanje liste nije uspjelo.');
            }
            console.log(`List with ID ${argID} deleted successfully.`);
            router.push('/saves');
        } catch (err: any) {
            setErrorMessage(err?.message ?? 'Brisanje liste nije uspjelo.');
        }
    };






    const renameList = (argID: number) => {
        // Implementation for renaming list
    };

    const addToList = (argID: number) => {
        // Implementation for adding to list
    };

    return (
        <div className="bg-[url('/bamboo.png')] bg-cover bg-center min-h-screen">
            <Navbar />

            <div className="bg-amber-100 mx-[10vw] p-5">
                <div className="border-4">
                    {errorMessage ? (
                        <>{errorMessage}</>
                    ) : (
                        list && (
                            <div className="border-2 p-2 mb-4 col-span-1">
                                <div className="flex justify-between items-center gap-2 h-10">
                                    <h2 className="font-semibold text-gray-800">{list.name}</h2>

                                    <div className="relative flex items-center">
                                        {isVisibleMoreOptionsList && (
                                            <div className="flex w-auto">
                                                <button onClick={() => setAlert_deleteList(true)} className="flex items-center gap-2 px-4 py-3 text-left text-gray-700 transition hover:bg-gray-100">
                                                    <FaTrash />
                                                    <span>Delete List</span>
                                                </button>

                                                <button onClick={() => renameList(list.id)} className="flex items-center gap-2 px-4 py-3 text-left text-gray-700 transition hover:bg-gray-100">
                                                    <FaPen />
                                                    <span>Rename List</span>
                                                </button>

                                                <button onClick={() => addToList(list.id)} className="flex items-center gap-2 px-4 py-3 text-left text-gray-700 transition hover:bg-gray-100">
                                                    <FaPlus />
                                                    <span>Add to list</span>
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={openMoreOptionsList}
                                            className="bg-gray-300 rounded-lg px-2 py-1.5 text-gray-700 shadow-sm hover:bg-gray-400 transition z-20"
                                        >
                                            <FaEllipsis />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>


                {/* Error */}
                {errorMessage && (<p className="relative text-red-500">{errorMessage}</p>)}

                {/* All Grid */}
                <AllCard
                    setSaveToDelete={setSaveToDelete}
                    alls={alls}
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
                />
            </div>

            {/* ---------------------------------------------MODALS--------------------------------------------- */}
            {alert_deleteList && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Delete List</h2>
                        <p className="mb-4">Are you sure you want to delete this list?</p>
                        <div className="flex justify-end gap-2">
                            <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={() => setAlert_deleteList(false)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={() => {
                                const listID = router.query.id as string;
                                setAlert_deleteList(false);
                                deleteList(Number(listID));
                            }}>
                                Delete
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
