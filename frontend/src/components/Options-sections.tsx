'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OptionsSections() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const isCommentsOrThreadsRoute = () => pathname === '/saves/comments' || pathname === '/saves/threads';

  const CSSlinkClass = (path: string) =>
    `flex gap-2 items-stretch py-1 px-2 rounded-2xl shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)] ${
      isActive(path) ? 'button_gradient_silver' : 'button_gradient_green'
  }`;




  return (
    <section className="bg-gradient-to-b from-[#6e7572] via-[#bfc5c3] to-[#f1f3f2] rounded-4xl p-4 shadow-lg">
      <div className="flex flex-row items-center gap-1 h-8 text-white">
        <Link href="/saves" className={CSSlinkClass('/saves')}>
          <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">Saves</h1>
        </Link>

        <Link href="/saves/all" className={CSSlinkClass('/saves/all')}>
          <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">All</h1>
        </Link>

        <Link href="/saves/lists" className={CSSlinkClass('/saves/lists')}>
          <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">Lists</h1>
        </Link>

        <Link href="/saves/posts" className={CSSlinkClass('/saves/posts')}>
          <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">Posts</h1>
        </Link>

        <Link href="/saves/comments" className={CSSlinkClass('/saves/comments')}>
          <h1 className="text-3xl text-white drop-shadow-[0_1px_1px_rgba(30,60,25,0.8)]">Comments</h1>
        </Link>
      </div>
    </section>
  );
}
