'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MainSidePanel from '@/components/Main-side-panel';
import OptionsSection from '@/components/Options-sections';
import FiltersSection from '@/components/Filters-section';
import {FaComment, FaImage, FaEllipsis, FaPen, FaTrash, FaMapPin, FaPlus,} from 'react-icons/fa6';
import '../../app/globals.css';
import { ListInterface, AllInterface } from '@/types/types';








export default function Posts() {
    const [isVisibleCreateListPanel, setIsVisibleCreateListPanel] = useState(false);


    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [lists, setLists] = useState<ListInterface[]>([]);

    const openOrCloseCreateListPanel = () => {
        setIsVisibleCreateListPanel((prev) => !prev);
    };


    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const [listsRes] = await Promise.all([
                    fetch(`http://localhost:3001/scrapper/lists`)
                ]);

                const failed = [listsRes].find((r) => !r.ok);
                if (failed) {
                    const errBody = await failed.json().catch(() => ({}));
                    throw new Error(errBody?.message ?? 'Failed to load lists.');
                }

                const listData: ListInterface[] = await listsRes.json();
                setLists(listData ?? []);
            } catch (err: any) {
                setErrorMessage(err?.message ?? 'Failed to load lists.');
            }
        };

        fetchPosts();
    }, []);

    const onKeyDownEscape = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            //asdas
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
                                </div>


                                <div className="grid grid-cols-7 auto-rows-[110px] gap-4 p-2">
                                    <button onClick={openOrCloseCreateListPanel} className="flex flex-col justify-center p-2 bg-gradient-to-b from-white/80 to-transparent text-center rounded-2xl shadow-xl">
                                        <img src="/icons/add.png" alt="create-list-icon" className="w-[50%] h-auto mx-auto" />
                                        <span>New list</span>
                                    </button>

                                    {lists.map((list) => (
                                        <Link
                                            key={list.id}
                                            href={`/saves/lists/${list.id}`}
                                            className="flex flex-col justify-center p-2 bg-gradient-to-b from-white/80 to-transparent text-center rounded-2xl shadow-xl"
                                        >
                                            <img src="/icons/list.png" alt="lists-icon" className="w-[50%] h-auto mx-auto" />
                                            <p>{list.name}</p>
                                        </Link>
                                    ))}
                                </div>

                                {errorMessage && <p className="text-red-500">{errorMessage}</p>}

                            </section>



                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
