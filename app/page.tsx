import { redirect } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import Pagination from "@/components/Pagination";
import { getQuestions } from "@/lib/questions";
import { getFeaturedQuestions, getFeaturedIds } from "@/lib/featured";
import { createClient } from "@/lib/supabase/server";
import { getUserVotes } from "@/lib/votes-server";

export const revalidate = 300;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requested = parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;

  const [featured, featuredIds] = await Promise.all([
    getFeaturedQuestions(),
    getFeaturedIds(),
  ]);

  const { questions, total, totalPages } = await getQuestions(
    page,
    10,
    featuredIds,
  );

  if (page > 1 && page > totalPages) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userVotes: Record<string, 1 | -1> = {};
  const allIds = [...featured.map((q) => q.id), ...questions.map((q) => q.id)];
  if (user && allIds.length > 0) {
    userVotes = await getUserVotes(user.id, allIds);
  }

  const showFeatured = featured.length > 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 transition-colors">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          BrainBench
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {total} {total === 1 ? "question" : "questions"} available
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {showFeatured && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
              <span aria-hidden>★</span>
              Featured
            </h2>
            {featured.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                userVote={userVotes[q.id] ?? null}
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

        {questions.length === 0 && !showFeatured ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No questions yet. Check back soon.
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              userVote={userVotes[q.id] ?? null}
              userId={user?.id ?? null}
            />
          ))
        )}

        <Pagination currentPage={page} totalPages={totalPages} />
      </div>
    </main>
  );
}
