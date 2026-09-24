import { redirect } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import Pagination from "@/components/Pagination";
import { getQuestions, searchQuestions } from "@/lib/questions";
import { getFeaturedQuestions, getFeaturedIds } from "@/lib/featured";
import { createClient } from "@/lib/supabase/server";
import { getUserVotes } from "@/lib/votes-server";

export const revalidate = 300;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const requested = parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;

  // Featured only shown in the default (non-search) view
  let featured: Awaited<ReturnType<typeof getFeaturedQuestions>> = [];
  let featuredIds: string[] = [];
  if (!q) {
    [featured, featuredIds] = await Promise.all([
      getFeaturedQuestions(),
      getFeaturedIds(),
    ]);
  }

  const result = q
    ? await searchQuestions(q, page, 10, featuredIds)
    : await getQuestions(page, 10, featuredIds);

  const { questions, total, totalPages } = result;

  if (page > 1 && page > totalPages) {
    redirect(q ? `/?q=${encodeURIComponent(q)}` : "/");
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

  const showFeatured = !q && featured.length > 0;
  const extraParams: Record<string, string> = q ? { q } : {};

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 transition-colors">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {q ? "Search results" : "BrainBench"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {q ? (
            <>
              {total} {total === 1 ? "match" : "matches"} for{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                &ldquo;{q}&rdquo;
              </span>
            </>
          ) : (
            <>
              {total} {total === 1 ? "question" : "questions"} available
            </>
          )}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
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
                  Try a different keyword or browse all questions.
                </p>
              </>
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
