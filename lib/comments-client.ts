"use client";

import { createClient } from "@/lib/supabase/client";

export async function createComment({
  questionId,
  userId,
  body,
  parentId = null,
}: {
  questionId: string;
  userId: string;
  body: string;
  parentId?: string | null;
}): Promise<void> {
  const supabase = createClient();

  const trimmed = body.trim();
  if (!trimmed) throw new Error("Comment cannot be empty.");
  if (trimmed.length > 5000) throw new Error("Comment is too long.");

  const { error } = await supabase.from("comments").insert({
    question_id: questionId,
    author_id: userId,
    parent_id: parentId,
    body: trimmed,
  });

  if (error) throw error;
}

export async function updateComment(
  commentId: string,
  body: string,
): Promise<void> {
  const supabase = createClient();

  const trimmed = body.trim();
  if (!trimmed) throw new Error("Comment cannot be empty.");

  const { error } = await supabase
    .from("comments")
    .update({ body: trimmed, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) throw error;
}

export async function softDeleteComment(commentId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("comments")
    .update({
      is_deleted: true,
      body: "[deleted]",
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId);

  if (error) throw error;
}
