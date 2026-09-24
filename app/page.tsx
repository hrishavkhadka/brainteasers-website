import { redirect } from "next/navigation";
import { Suspense } from "react";
import QuestionCard from "@/components/QuestionCard";
import Pagination from "@/components/Pagination";
import SortFilterBar from "@/components/SortFilterBar";
import { queryQuestions, type SortOption } from "@/lib/questions";
import { getFeaturedQuestions, getFeaturedIds } from "@/lib/featured";
import { createClient } from "@/lib/supabase/server";
import { getUserVotes } from "@/lib/votes-server";
import type { QuestionCategory } from "@/types/question";

export const revalidate = 300;

const VALID_SORTS: SortOption[] = ["new", "old", "top"];
const VALID_CATEGORIES: QuestionCategory[] = [
  "verbal",
  "numerical",
  "spatial",
  "logical",
  "pattern",
  "memory",
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    sort?: string;
    category?: string;
    level?: string;
  }>;
}) {
  const params = await searchParams;

  const q = (params.q ?? "").trim();

  const sortParam = (params.sort ?? "new") as SortOption;
  const sort: SortOption = VALID_SORTS.includes(sortParam) ? sortParam : "new";

  const categoryParam = params.category ?? "";
  const category: QuestionCategory | undefined = VALID_CATEGORIES.includes(
    categoryParam as QuestionCategory,
  )
    ? (categoryParam as QuestionCategory)
    : undefined;

  const levelNum = parseInt(params.level ?? "", 10);
  const level =
    Number.isFinite(levelNum) && levelNum >= 1 && levelNum <= 10
      ? levelNum
      : undefined;

  const requested = parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;

  const hasFilterOrSearch = !!q || !!category || !!level;

  // Featured hidden when searching or filtering
  let featured: Awaited<ReturnType<typeof getFeaturedQuestions>> = [];
  let featuredIds: string[] = [];
  if (!hasFilterOrSearch) {
    [featured, featuredIds] = await Promise.all([
      getFeaturedQuestions(),
      getFeaturedIds(),
    ]);
  }

  const { questions, total, totalPages } = await queryQuestions({
    page,
    pageSize: 10,
    search: q || undefined,
    category,
    level,
    sort,
    excludeIds: featuredIds,
  });

  if (page > 1 && page > totalPages) {
    const fallbackParams = new URLSearchParams();
    if (q) fallbackParams.set("q", q);
    if (category) fallbackParams.set("category", category);
    if (level) fallbackParams.set("level", String(level));
    if (sort !== "new") fallbackParams.set("sort", sort);
    const qs = fallbackParams.toString();
    redirect(qs ? `/?${qs}` : "/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userVotes: Record<string, 1 | -1> = {};
  const allIds = [...featured.map((x) => x.id), ...questions.map((x) => x.id)];
  if (user && allIds.length > 0) {
    userVotes = await getUserVotes(user.id, allIds);
  }

  const showFeatured = !hasFilterOrSearch && featured.length > 0;

  const extraParams: Record<string, string> = {};
  if (q) extraParams.q = q;
  if (category) extraParams.category = category;
  if (level) extraParams.level = String(level);
  if (sort !== "new") extraParams.sort = sort;

  // Header text
  let heading = "BrainBench";
  let subtitle: React.ReactNode = `${total} ${total === 1 ? "question" : "questions"} available`;

  if (q) {
    heading = "Search results";
    subtitle = (
      <>
        {total} {total === 1 ? "match" : "matches"} for{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          &ldquo;{q}&rdquo;
        </span>
      </>
    );
  } else if (category || level) {
    const parts: string[] = [];
    if (category) parts.push(category);
    if (level) parts.push(`level ${level}`);
    subtitle = (
      <>
        {total} {total === 1 ? "question" : "questions"} · {parts.join(" · ")}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 transition-colors">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {heading}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Suspense fallback={<div className="h-10 mb-4" />}>
          <SortFilterBar />
        </Suspense>

        {showFeatured && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
              <span aria-hidden>★</span>
              Featured
            </h2>
            {featured.map((x) => (
              <QuestionCard
                key={x.id}
                question={x}
                userVote={userVotes[x.id] ?? null}
                userId={user?.id ?? null}
              />
            ))}
          </section>
        )}

        {showFeatured && questions.length > 0 && (
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            All questions
          </h2>
        )}

        {questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            {q ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  No matches for &ldquo;{q}&rdquo;
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Try a different keyword or clear the filters.
                </p>
              </>
            ) : category || level ? (
              <p className="text-gray-600 dark:text-gray-400">
                No questions match these filters.
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No questions yet. Check back soon.
              </p>
            )}
          </div>
        ) : (
          questions.map((x) => (
            <QuestionCard
              key={x.id}
              question={x}
              userVote={userVotes[x.id] ?? null}
              userId={user?.id ?? null}
            />
          ))
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          extraParams={extraParams}
        />
      </div>
    </main>
  );
}
