import { createClient } from "@/lib/supabase/server";
import { getCommentsForQuestion } from "@/lib/comments";
import CommentComposer from "./CommentComposer";
import CommentItem from "./CommentItem";
import type { Comment } from "@/types/comment";

export default async function CommentSection({
  questionId,
}: {
  questionId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const comments = await getCommentsForQuestion(questionId);

  const topLevel = comments.filter((c) => c.parent_id === null);

  // Build reply map: parentId -> [replies]
  const repliesByParent = new Map<string, Comment[]>();
  for (const c of comments) {
    if (c.parent_id) {
      const list = repliesByParent.get(c.parent_id) ?? [];
      list.push(c);
      repliesByParent.set(c.parent_id, list);
    }
  }

  // Count all non-deleted comments (matches questions.comment_count)
  const visibleCount = comments.filter((c) => !c.is_deleted).length;

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Discussion
        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
          {visibleCount} {visibleCount === 1 ? "comment" : "comments"}
        </span>
      </h2>

      <div className="mb-6">
        <CommentComposer questionId={questionId} userId={user?.id ?? null} />
      </div>

      {topLevel.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No comments yet. Be the first.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesByParent.get(c.id) ?? []}
              currentUserId={user?.id ?? null}
              questionId={questionId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
