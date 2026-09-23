import { createClient } from "@/lib/supabase/server";
import type { Comment } from "@/types/comment";

export async function getCommentsForQuestion(
  questionId: string,
): Promise<Comment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, question_id, author_id, parent_id, body, created_at, updated_at, is_deleted, upvotes, downvotes",
    )
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const rows = data as unknown as Comment[];

  const authorIds = Array.from(
    new Set(rows.map((r) => r.author_id).filter((id): id is string => !!id)),
  );

  const usernameMap = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", authorIds);
    profiles?.forEach((p) => usernameMap.set(p.id, p.username));
  }

  return rows.map((c) => ({
    ...c,
    authorUsername: c.author_id ? (usernameMap.get(c.author_id) ?? null) : null,
  }));
}
