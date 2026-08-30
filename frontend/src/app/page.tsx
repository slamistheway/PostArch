'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import MainSidePanel from '@/components/Main-side-panel';
import { FaComment, FaImage } from 'react-icons/fa6';
import { AllInterface } from '@/types/types';
import { truncate } from '@/shared/functions';



export default function Home() {
  const [pinned, setPinned] = useState<AllInterface[]>([]);
  const [alls, setAlls] = useState<AllInterface[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pinnedRes, allsRes] = await Promise.all([
          fetch(`http://localhost:3001/scrapper/pinned?pageType=homePage`),
          fetch(`http://localhost:3001/scrapper/all?pageType=homePage`),
        ]);

        if (!pinnedRes.ok || !allsRes.ok) {
          const failedRes = !pinnedRes.ok ? pinnedRes : allsRes;
          const errBody = await failedRes.json().catch(() => ({}));
          throw new Error(errBody?.message ?? 'Failed to load data.');
        }

        const pinnedData: AllInterface[] = await pinnedRes.json();
        const allsData: AllInterface[] = await allsRes.json();

        setPinned(pinnedData ?? []);
        setAlls(allsData ?? []);
      } catch (err: any) {
        setErrorMessage(err?.message ?? 'Failed to load data.');
      }
    };

    fetchData();
  }, []);

  return (
      <div className="bg-[url('/bamboo.png')] bg-cover bg-center min-h-screen">
        <Navbar />

        <div className="mx-[10vw] p-5">
          <div className="flex flex-col gap-4">
            <div className="flex gap-6">
              <aside className="w-1/7">
                <MainSidePanel />
              </aside>

              <main className="w-6/7 flex flex-col gap-4">
                {/* --------------------------------------------- PINNED --------------------------------------------- */}
                <section className="relative overflow-hidden px-3 py-1 rounded-3xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
                  {/* Top gloss */}
                  <div className="absolute top-0 left-0 w-full h-1/3 rounded-t-3xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  {/* Bottom gloss */}
                  <div className="absolute bottom-0 left-0 w-full h-[90%] rounded-t-[20%] bg-gradient-to-t from-black/35 via-black/15 to-transparent pointer-events-none" />

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 h-8">
                      <img src="/icons/pinned.png" alt="posts-icon" className="h-full w-auto" />
                      <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">
                        Pinned
                      </h1>
                    </div>
                  </div>

                  {errorMessage && <p className="text-red-500">{errorMessage}</p>}

                  <div className="grid grid-cols-4 rounded-b-3xl auto-rows-[150px] gap-4 p-2">
                    {pinned.map((item) => (
                        <Link
                            key={item.id}
                            href={`/postView/${item.id}`}
                            className="flex flex-col px-2 bg-gradient-to-b from-white/80 to-transparent text-center rounded-2xl shadow-xl"
                        >
                          <div className="mt-1 font-bold text-gray-800">
                            <span> u/{item.author}</span>
                          </div>

                          <h1 className="text-gray-600 flex items-center justify-center gap-1">
                            {item.title == null ? (
                                <>
                                  <FaComment />
                                  {truncate(item.content)}
                                </>
                            ) : (
                                <>
                                  <FaImage />
                                  {truncate(item.title)}
                                </>
                            )}
                          </h1>
                        </Link>
                    ))}
                  </div>
                </section>

                {/* --------------------------------------------- RECENT --------------------------------------------- */}
                <section className="relative overflow-hidden px-3 py-1 rounded-3xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
                  {/* Top gloss */}
                  <div className="absolute top-0 left-0 w-full h-1/3 rounded-t-3xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  {/* Bottom gloss */}
                  <div className="absolute bottom-0 left-0 w-full h-[90%] rounded-t-[20%] bg-gradient-to-t from-black/35 via-black/15 to-transparent pointer-events-none" />

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 h-8">
                      <img src="/icons/recent.png" alt="posts-icon" className="h-full w-auto" />
                      <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">
                        Recent
                      </h1>
                    </div>
                    <Link href="/saves/all" className="underline">
                      See more
                    </Link>
                  </div>

                  {errorMessage && <p className="text-red-500">{errorMessage}</p>}

                  <div className="grid grid-cols-4 rounded-b-3xl auto-rows-[150px] gap-4 p-2">
                    {alls.map((item) => (
                        <Link
                            key={item.id}
                            href={`/postView/${item.id}`}
                            className="flex flex-col px-2 bg-gradient-to-b from-white/80 to-transparent text-center rounded-2xl shadow-xl"
                        >
                          <div className="mt-1 font-bold text-gray-800">u/{item.author}</div>

                          <h1 className="text-gray-600 flex items-center justify-center gap-1">
                            {item.title == null ? (
                                <>
                                  <FaComment />
                                  {truncate(item.content)}
                                </>
                            ) : (
                                <>
                                  <FaImage />
                                  {truncate(item.title)}
                                </>
                            )}
                          </h1>
                        </Link>
                    ))}
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>
  );
}
