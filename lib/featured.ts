import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/types/question";

const FEATURED_COLUMNS = [
  "id",
  "author_id",
  "created_at",
  "question_text",
  "question_image_url",
  "answer_text",
  "answer_image_url",
  "explanation_text",
  "explanation_image_url",
  "hints",
  "category",
  "difficulty",
  "qualification",
  "source_text",
  "source_url",
  "status",
  "rejection_reason",
  "featured",
  "featured_order",
  "upvotes",
  "downvotes",
  "score",
  "comment_count",
].join(",");

export async function getFeaturedQuestions(): Promise<Question[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questions")
    .select(FEATURED_COLUMNS)
    .eq("status", "published")
    .eq("featured", true)
    .order("featured_order", { ascending: true, nullsFirst: false });

  if (error || !data) return [];

  const rows = data as unknown as Question[];

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

  return rows.map((q) => ({
    ...q,
    authorUsername: q.author_id ? (usernameMap.get(q.author_id) ?? null) : null,
  }));
}

export async function getFeaturedIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("questions")
    .select("id")
    .eq("status", "published")
    .eq("featured", true);

  return (data ?? []).map((r) => r.id);
}
