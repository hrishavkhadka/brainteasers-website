import { redirect } from "next/navigation";
import QuestionCard from "@/components/QuestionCard";
import ThemeToggle from "@/components/ThemeToggle";
import Pagination from "@/components/Pagination";
import { getQuestions } from "@/lib/questions";

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requested = parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(requested) && requested > 0 ? requested : 1;

  const { questions, total, totalPages } = await getQuestions(page);

  // If the requested page has no questions, go back to page 1.
  if (page > 1 && page > totalPages) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 transition-colors">
      <div className="max-w-2xl mx-auto mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            IQ Questions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} {total === 1 ? "question" : "questions"} available
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        {questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No questions yet. Check back soon.
            </p>
          </div>
        ) : (
          questions.map((q) => <QuestionCard key={q.id} question={q} />)
        )}

        <Pagination currentPage={page} totalPages={totalPages} />
      </div>
    </main>
  );
}
