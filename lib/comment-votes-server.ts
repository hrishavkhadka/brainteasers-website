import { createClient } from "@/lib/supabase/server";
import type { VoteValue } from "./comment-votes";

export async function getUserCommentVotes(
  userId: string,
  commentIds: string[],
): Promise<Record<string, VoteValue>> {
  if (commentIds.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comment_votes")
    .select("comment_id, value")
    .eq("user_id", userId)
    .in("comment_id", commentIds);

  if (error) throw error;

  const map: Record<string, VoteValue> = {};
  data?.forEach((row) => {
    map[row.comment_id] = row.value as VoteValue;
  });
  return map;
}
