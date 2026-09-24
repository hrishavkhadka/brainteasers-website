"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SortOption } from "@/lib/questions";

const CATEGORIES = [
  "verbal",
  "numerical",
  "spatial",
  "logical",
  "pattern",
  "memory",
] as const;

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Menu = "sort" | "category" | "level" | null;

const sortLabels: Record<SortOption, string> = {
  new: "Newest",
  old: "Oldest",
  top: "Top",
};

export default function SortFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);
  const [openMenu, setOpenMenu] = useState<Menu>(null);

  const currentSort = (searchParams.get("sort") as SortOption) ?? "new";
  const currentCategory = searchParams.get("category") ?? "";
  const currentLevel = searchParams.get("level") ?? "";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Any change resets to page 1
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
    setOpenMenu(null);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sort");
    params.delete("category");
    params.delete("level");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
    setOpenMenu(null);
  }

  const hasFilters =
    !!currentCategory || !!currentLevel || currentSort !== "new";

  const btnCls = (active: boolean) =>
    `flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
      active
        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200"
        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  const menuCls =
    "absolute top-full left-0 mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[10rem] max-h-80 overflow-y-auto";

  const itemCls = (active: boolean) =>
    `w-full text-left px-3 py-1.5 text-sm transition-colors ${
      active
        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium"
        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  return (
    <div ref={ref} className="flex flex-wrap items-center gap-2 mb-4">
      {/* Sort */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}
          className={btnCls(currentSort !== "new")}
        >
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Sort:
          </span>
          {sortLabels[currentSort]}
          <span aria-hidden className="text-xs">
            ▾
          </span>
        </button>
        {openMenu === "sort" && (
          <div className={menuCls}>
            {(["new", "old", "top"] as SortOption[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateParam("sort", s === "new" ? null : s)}
                className={itemCls(currentSort === s)}
              >
                {sortLabels[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setOpenMenu(openMenu === "category" ? null : "category")
          }
          className={btnCls(!!currentCategory)}
        >
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Type:
          </span>
          {currentCategory || "All"}
          <span aria-hidden className="text-xs">
            ▾
          </span>
        </button>
        {openMenu === "category" && (
          <div className={menuCls}>
            <button
              type="button"
              onClick={() => updateParam("category", null)}
              className={itemCls(!currentCategory)}
            >
              All types
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateParam("category", c)}
                className={itemCls(currentCategory === c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Level */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === "level" ? null : "level")}
          className={btnCls(!!currentLevel)}
        >
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            Level:
          </span>
          {currentLevel || "All"}
          <span aria-hidden className="text-xs">
            ▾
          </span>
        </button>
        {openMenu === "level" && (
          <div className={menuCls}>
            <button
              type="button"
              onClick={() => updateParam("level", null)}
              className={itemCls(!currentLevel)}
            >
              All levels
            </button>
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => updateParam("level", String(l))}
                className={itemCls(currentLevel === String(l))}
              >
                Level {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1"
        >
          Clear
        </button>
      )}
    </div>
  );
}
