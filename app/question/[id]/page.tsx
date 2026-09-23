import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getQuestion } from "@/lib/questions";
import { getUserVotes } from "@/lib/votes-server";
import QuestionCard from "@/components/QuestionCard";
import CommentSection from "@/components/CommentSection";

export const revalidate = 300;

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await getQuestion(id);

  if (!question) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userVote: 1 | -1 | null = null;
  if (user) {
    const votes = await getUserVotes(user.id, [question.id]);
    userVote = votes[question.id] ?? null;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 transition-colors">
      <div className="max-w-3xl mx-auto mb-4">
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← All questions
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <QuestionCard
          question={question}
          userVote={userVote}
          userId={user?.id ?? null}
        />

        <CommentSection questionId={question.id} />
      </div>
    </main>
  );
}
