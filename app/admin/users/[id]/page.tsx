import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { Question, QuestionStatus } from "@/types/question";

export const dynamic = "force-dynamic";

const statusStyles: Record<QuestionStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const statusLabels: Record<QuestionStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  published: "Published",
  rejected: "Rejected",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) {
    redirect("/");
  }

  const { id } = await params;
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, email, is_admin, can_submit, created_at")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  const { data: questions } = await supabase
    .from("questions")
    .select(
      "id, created_at, question_text, question_image_url, category, difficulty, status, upvotes, downvotes",
    )
    .eq("author_id", id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← All users
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-1">
          {profile.username}
          {profile.is_admin && (
            <span className="ml-3 text-sm px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 align-middle">
              admin
            </span>
          )}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {profile.email ?? "—"} · joined{" "}
          {new Date(profile.created_at).toLocaleDateString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Submissions {profile.can_submit ? "allowed" : "paused"}
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {!questions || questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              This user hasn&apos;t submitted any questions.
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-3"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[q.status as QuestionStatus]}`}
                >
                  {statusLabels[q.status as QuestionStatus]}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {q.category}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  Level {q.difficulty}/10
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400">
                  ▲ {q.upvotes}
                </span>
                <span className="text-xs text-red-700 dark:text-red-400">
                  ▼ {q.downvotes}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {new Date(q.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {q.question_text ?? "(image only)"}
              </p>
              {q.question_image_url && (
                <img
                  src={q.question_image_url}
                  alt=""
                  className="max-h-32 rounded mt-2 border border-gray-200 dark:border-gray-700"
                />
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
