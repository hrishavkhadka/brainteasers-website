"use client";

import { createClient } from "@/lib/supabase/client";

export type VoteValue = 1 | -1;

export async function castCommentVote(
  commentId: string,
  userId: string,
  value: VoteValue,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("comment_votes").upsert(
    {
      comment_id: commentId,
      user_id: userId,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "comment_id,user_id" },
  );

  if (error) throw error;
}

export async function removeCommentVote(
  commentId: string,
  userId: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("comment_votes")
    .delete()
    .eq("comment_id", commentId)
    .eq("user_id", userId);

  if (error) throw error;
}
