import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import AdminQuestionRow from "@/components/AdminQuestionRow";
import type { Question } from "@/types/question";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/");
  }

  const supabase = await createClient();

  // Fetch pending questions plus author usernames in one go.
  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-red-600 dark:text-red-400">
            Failed to load pending questions: {error.message}
          </p>
        </div>
      </main>
    );
  }

  // Fetch usernames for the authors
  const authorIds = Array.from(
    new Set((questions ?? []).map((q) => q.author_id).filter(Boolean)),
  ) as string[];

  const usernameMap = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", authorIds);
    profiles?.forEach((p) => usernameMap.set(p.id, p.username));
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Admin · Pending questions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {questions?.length ?? 0}{" "}
          {(questions?.length ?? 0) === 1 ? "question" : "questions"} awaiting
          review
        </p>
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
        >
          ← Back to public site
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        {!questions || questions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Nothing pending. All caught up.
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <AdminQuestionRow
              key={q.id}
              question={q as Question}
              authorUsername={
                q.author_id ? (usernameMap.get(q.author_id) ?? null) : null
              }
            />
          ))
        )}
      </div>
    </main>
  );
}
