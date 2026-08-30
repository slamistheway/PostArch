"use client";

import Link from "next/link";
import { FaMagnifyingGlass, FaArrowRight } from "react-icons/fa6";



function Navbar() {


  return (
    <nav className="relative flex h-17 items-stretch bg-linear-to-b from-[#f1f3f2] via-[#bfc5c3] to-[#6e7572] px-6 py-3 shadow-xl">
      {/* Logo */}
      <Link href="/" className="button_gradient_green relative flex items-center justify-center rounded-4xl px-6 shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)]">
        {/* TOP GLOSS */}
        <div className="top-gloss-button" />

        {/* BOTTOM GLOSS */}
        <div className="full-gloss-button" />

        <span className="relative text-[22px] font-semibold tracking-wide">
          PostArchiver
        </span>
      </Link>

      {/* SEARCH */}
      <div className="mx-auto flex h-auto w-full max-w-xl rounded-full bg-[rgb(0,0,0,0.2)]">
        {/* Search input */}
        <div className="relative flex flex-1 rounded-full border-2 border-gray-500 bg-white">
          {/* SEARCH ICON */}
          <FaMagnifyingGlass className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />

          {/* SEARCH INPUT */}
          <input
            type="text"
            placeholder="Pretraži objave i komentare"
            className="z-5 w-full flex-1 rounded-full pl-8 text-2xl outline-none placeholder:text-gray-500"
          />
        </div>

        {/* SEARCH BUTTON */}
        <Link
          href="/saves/all"
          className="button_gradient_green relative ml-1 flex h-full aspect-square cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-[#9AE27A] to-[#4C8C42] shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)]"
        >
          {/* Top glass */}
          <div className="top-gloss-button-round" />

          {/* Full gloss */}
          <div className="full-gloss-button" />

          <FaArrowRight className="relative text-white" />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
