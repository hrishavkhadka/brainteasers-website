import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { getFeaturedQuestions } from "@/lib/featured";
import AdminFeaturedList from "@/components/AdminFeaturedList";
import type { Question } from "@/types/question";

export const dynamic = "force-dynamic";

export default async function AdminFeaturedPage() {
  if (!(await isAdmin())) {
    redirect("/");
  }

  const supabase = await createClient();
  const featured = await getFeaturedQuestions();

  const { data: publishedRaw } = await supabase
    .from("questions")
    .select(
      "id, author_id, created_at, question_text, question_image_url, answer_text, answer_image_url, explanation_text, explanation_image_url, hints, category, difficulty, qualification, source_text, source_url, status, rejection_reason, featured, featured_order, upvotes, downvotes, comment_count",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(200);

  const published = (publishedRaw ?? []) as unknown as Question[];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Admin · Featured
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pin questions to the top of the home page. Reorder with the
              arrows.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Pending
            </Link>
            <Link
              href="/admin/reports"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reports →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <AdminFeaturedList featured={featured} published={published} />
      </div>
    </main>
  );
}
