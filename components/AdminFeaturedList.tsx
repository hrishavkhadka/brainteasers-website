"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Question } from "@/types/question";

export default function AdminFeaturedList({
  featured,
  published,
}: {
  featured: Question[];
  published: Question[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  async function pinQuestion(id: string) {
    setError(null);
    setBusy(true);
    const supabase = createClient();

    const maxOrder = featured.reduce(
      (max, q) => Math.max(max, q.featured_order ?? 0),
      -1,
    );

    const { error } = await supabase
      .from("questions")
      .update({ featured: true, featured_order: maxOrder + 1 })
      .eq("id", id);

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function unpinQuestion(id: string) {
    setError(null);
    setBusy(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("questions")
      .update({ featured: false, featured_order: null })
      .eq("id", id);

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= featured.length) return;

    setError(null);
    setBusy(true);
    const supabase = createClient();

    // Swap positions
    const reordered = [...featured];
    [reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ];

    // Renumber sequentially and persist
    const updates = reordered.map((q, i) =>
      supabase.from("questions").update({ featured_order: i }).eq("id", q.id),
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    setBusy(false);
    if (failed?.error) {
      setError(failed.error.message);
      return;
    }
    router.refresh();
  }

  const featuredIds = new Set(featured.map((q) => q.id));
  const pinCandidates = published.filter(
    (q) => !featuredIds.has(q.id) && !q.featured,
  );

  const filtered = filter.trim()
    ? pinCandidates.filter((q) =>
        (q.question_text ?? "").toLowerCase().includes(filter.toLowerCase()),
      )
    : pinCandidates;

  function preview(text: string | null, max = 140) {
    if (!text) return "(image only)";
    return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-3">
          {error}
        </p>
      )}

      {/* Featured */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">
          Currently pinned ({featured.length})
        </h2>
        {featured.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nothing pinned. Use the list below to feature questions.
            </p>
          </div>
        ) : (
          featured.map((q, i) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 mb-2 flex items-start gap-3"
            >
              <div className="flex flex-col gap-1 shrink-0 mt-0.5">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={busy || i === 0}
                  aria-label="Move up"
                  className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 flex items-center justify-center text-xs"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={busy || i === featured.length - 1}
                  aria-label="Move down"
                  className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 flex items-center justify-center text-xs"
                >
                  ▼
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    #{i + 1}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {q.category} · Level {q.difficulty}/10
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                  {preview(q.question_text)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <Link
                    href={`/question/${q.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View →
                  </Link>
                  <button
                    type="button"
                    onClick={() => unpinQuestion(q.id)}
                    disabled={busy}
                    className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
                  >
                    Unpin
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Pin candidates */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            All published questions ({pinCandidates.length})
          </h2>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by text…"
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
        </div>

        {pinCandidates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No other published questions to pin.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No matches for &ldquo;{filter}&rdquo;.
            </p>
          </div>
        ) : (
          filtered.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-2 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {q.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    Level {q.difficulty}/10
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ▲ {q.upvotes} ▼ {q.downvotes}
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                  {preview(q.question_text)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => pinQuestion(q.id)}
                disabled={busy}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/60 font-medium disabled:opacity-60 shrink-0"
              >
                Pin
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
