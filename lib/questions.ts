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

  const total = count ?? 0;
  return {
    questions: (data ?? []) as unknown as Question[],
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page,
  };
}
