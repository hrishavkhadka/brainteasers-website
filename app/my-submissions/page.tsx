import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Question, QuestionStatus } from "@/types/question";

const statusStyles: Record<QuestionStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  removed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const statusLabels: Record<QuestionStatus, string> = {
  draft: "Draft",
  pending: "Pending review",
  published: "Published",
  rejected: "Rejected",
  removed: "Removed by moderator",
};

export const dynamic = "force-dynamic";

export default async function MySubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          My submissions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {questions?.length ?? 0}{" "}
          {(questions?.length ?? 0) === 1 ? "question" : "questions"} submitted
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {error ? (
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/40 rounded-xl p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load submissions: {error.message}
            </p>
          </div>
        ) : !questions || questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven&apos;t submitted any questions yet.
            </p>
            <Link
              href="/submit"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Submit your first question
            </Link>
          </div>
        ) : (
          questions.map((q) => {
            const typed = q as Question;
            return (
              <div
                key={typed.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-3"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[typed.status]}`}
                  >
                    {statusLabels[typed.status]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {typed.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    Level {typed.difficulty}
                  </span>
                </div>

                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {typed.question_text ?? "(image only)"}
                </p>
                {typed.question_image_url && (
                  <img
                    src={typed.question_image_url}
                    alt=""
                    className="max-h-32 rounded mt-2 border border-gray-200 dark:border-gray-700"
                  />
                )}

                {typed.status === "rejected" && typed.rejection_reason && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40">
                    <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">
                      Reason for rejection
                    </p>
                    <p className="text-sm text-red-900 dark:text-red-200 whitespace-pre-wrap">
                      {typed.rejection_reason}
                    </p>
                  </div>
                )}

                {typed.status === "removed" && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    This question was removed by a moderator and no longer
                    appears on the site.
                  </p>
                )}

                {typed.status === "published" && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Live on the site.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
