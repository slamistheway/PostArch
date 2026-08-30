"use client";

import { useState } from "react";
import {
  FaChevronDown,
  FaArrowRight,
} from "react-icons/fa6";

interface FiltersSectionProps {
  initialSubreddits?: string[];
  initialKeywords?: string[];
}

export default function FiltersSection({
  initialSubreddits = [],
  initialKeywords = [],
}: FiltersSectionProps) {
  const [isVisibleOrderByPanel, setIsVisibleOrderByPanel] = useState(false);
  const [isVisibleSubredditsPanel, setIsVisibleSubredditsPanel] =
    useState(false);

  const [orderBy, setOrderBy] = useState("Newest");
  const [subreddits, setSubreddits] =
    useState<string[]>(initialSubreddits);
  const [keywords, setKeywords] =
    useState<string[]>(initialKeywords);

  const chooseOrderBy = (arg: string) => {
    setOrderBy(arg);
    setIsVisibleOrderByPanel(false);
  };

  const removeSubreddit = (arg: string) => {
    setSubreddits((prev) =>
      prev.filter((s) => s !== arg)
    );
  };

  const removeKeyword = (arg: string) => {
    setKeywords((prev) =>
      prev.filter((k) => k !== arg)
    );
  };

  return (
    <section className="rounded-4xl bg-gradient-to-b from-[#6e7572] via-[#bfc5c3] to-[#f1f3f2] shadow-lg">
      <div className="flex items-center gap-2">

        {/* FILTERS */}
        <div className="button_gradient_green flex h-10 items-center gap-1 rounded-full px-3 shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)]">
          <img src="/icons/filters.png" alt="filters-icon" className="h-full w-auto"/>
          <span>Filters</span>
        </div>

        {/* ORDER BY */}
        <div className="relative">
          <button
            onClick={() => setIsVisibleOrderByPanel((prev) => !prev)}
            className="button_gradient_silver flex h-10 items-center gap-1 rounded-full px-3 shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)]"
          >
            <span>Order by: {orderBy}</span>
            <FaArrowRight className="text-white" />
          </button>

          {isVisibleOrderByPanel && (
            <div className="absolute z-10 mt-2 flex w-full flex-col justify-center rounded-md bg-white shadow-lg">
              <button onClick={() => chooseOrderBy("Newest")}>
                Newest
              </button>

              <button onClick={() => chooseOrderBy("Oldest")}>
                Oldest
              </button>

              <button onClick={() => chooseOrderBy("Most Liked")}>
                Most Liked
              </button>

              <button onClick={() => chooseOrderBy("Least Liked")}>
                Least Liked
              </button>
            </div>
          )}
        </div>

        {/* SUBREDDITS */}
        <div className="relative">
          <button
            onClick={() => setIsVisibleSubredditsPanel((prev) => !prev)}
            className="button_gradient_silver flex h-10 items-center gap-1 rounded-full px-3 shadow-[inset_0_1px_0_rgba(0,0,0,.3),inset_0_-6px_4px_rgba(40,90,35,.25)]"
          >
            <span>Subreddits</span>
            <FaChevronDown className="text-white" />
          </button>

          {isVisibleSubredditsPanel && (
            <div className="absolute z-10 mt-2 flex w-full flex-col justify-center rounded-md bg-white shadow-lg">
              {subreddits.map((subreddit) => (
                <button
                  key={subreddit}
                  onClick={() => removeSubreddit(subreddit)}
                  className="px-3 py-1 text-left hover:bg-gray-100"
                >
                  {subreddit}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

