"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({
  initialValue = "",
  className = "",
}: {
  initialValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  // Keep input in sync if the URL changes (e.g. back button)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/");
    }
  }

  function handleClear() {
    setValue("");
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative">
        <span
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm pointer-events-none"
        >
          🔍
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search questions, hints, sources…"
          aria-label="Search questions"
          className="w-full pl-9 pr-9 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-sm"
          >
            ×
          </button>
        )}
      </div>
    </form>
  );
}
