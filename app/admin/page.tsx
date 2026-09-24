import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import AdminQuestionRow from "@/components/AdminQuestionRow";
import SiteSettingsToggle from "@/components/SiteSettingsToggle";
import type { Question } from "@/types/question";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect("/");
  }

  const supabase = await createClient();
  const settings = await getSiteSettings();

  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-red-600 dark:text-red-400">
            Failed to load pending questions: {error.message}
          </p>
        </div>
      </main>
    );
  }

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
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Admin
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {questions?.length ?? 0}{" "}
              {(questions?.length ?? 0) === 1 ? "question" : "questions"}{" "}
              awaiting review
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/reports"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reports →
            </Link>
            <Link
              href="/admin/featured"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Featured →
            </Link>
            <Link
              href="/admin/users"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Users →
            </Link>
            <Link
              href="/"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Site →
            </Link>
          </div>
        </div>
      </div>

      {/* Global settings */}
      <div className="max-w-3xl mx-auto mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          Global controls
        </h2>
        <div className="flex flex-col gap-2">
          <SiteSettingsToggle
            settingKey="submissions_paused"
            label="Pause new submissions"
            description="When on, no user (except admins) can submit new questions."
            initialValue={settings.submissions_paused}
          />
          <SiteSettingsToggle
            settingKey="signups_paused"
            label="Pause new account signups"
            description="When on, new users cannot create accounts. Existing users can still sign in."
            initialValue={settings.signups_paused}
          />
          <SiteSettingsToggle
            settingKey="comments_paused"
            label="Pause comments"
            description="When on, no user (except admins) can post new comments or replies."
            initialValue={settings.comments_paused}
          />
          <SiteSettingsToggle
            settingKey="reports_paused"
            label="Pause reports"
            description="When on, users cannot submit reports on questions or comments."
            initialValue={settings.reports_paused}
          />
        </div>
      </div>

      {/* Pending questions */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          Pending review
        </h2>
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
              question={q as unknown as Question}
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
