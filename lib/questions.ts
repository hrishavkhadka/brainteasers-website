import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/types/question";

const DEFAULT_PAGE_SIZE = 10;

const QUESTION_COLUMNS = [
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
].join(",");

export type QuestionsPage = {
  questions: Question[];
  total: number;
  totalPages: number;
  page: number;
};

export async function getQuestions(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<QuestionsPage> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getQuestions failed:", error);
    return { questions: [], total: 0, totalPages: 0, page };
  }

  const rows = (data ?? []) as unknown as Question[];

  // Fetch usernames for the authors of these questions (one extra query)
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

  const questions: Question[] = rows.map((q) => ({
    ...q,
    authorUsername: q.author_id ? (usernameMap.get(q.author_id) ?? null) : null,
  }));

  const total = count ?? 0;
  return {
    questions,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page,
  };
}
