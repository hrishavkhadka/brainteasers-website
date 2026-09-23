"use client";

import { createClient } from "@/lib/supabase/client";

export type VoteValue = 1 | -1;

export async function castVote(
  questionId: string,
  userId: string,
  value: VoteValue,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("question_votes").upsert(
    {
      question_id: questionId,
      user_id: userId,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "question_id,user_id" },
  );

  if (error) throw error;
}

export async function removeVote(
  questionId: string,
  userId: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("question_votes")
    .delete()
    .eq("question_id", questionId)
    .eq("user_id", userId);

  if (error) throw error;
}
