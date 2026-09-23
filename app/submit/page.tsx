import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canUserSubmit } from "@/lib/settings";
import SubmitQuestionForm from "@/components/SubmitQuestionForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const allowed = await canUserSubmit(user.id);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Submit a question
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share a puzzle or reasoning question with the community.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {allowed ? (
          <SubmitQuestionForm userId={user.id} />
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
              Question submissions are temporarily paused
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please check back later.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
