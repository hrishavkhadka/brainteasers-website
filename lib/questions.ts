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
  "score",
  "comment_count",
].join(",");

async function attachUsernames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: Question[],
): Promise<Question[]> {
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

function escapeLike(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

export type SortOption = "new" | "old" | "top";

export type QueryOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  level?: number;
  sort?: SortOption;
  excludeIds?: string[];
};

export type QuestionsPage = {
  questions: Question[];
  total: number;
  totalPages: number;
  page: number;
};

export async function queryQuestions(
  opts: QueryOptions = {},
): Promise<QuestionsPage> {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    search,
    category,
    level,
    sort = "new",
    excludeIds = [],
  } = opts;

  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("questions")
    .select(QUESTION_COLUMNS, { count: "exact" })
    .eq("status", "published");

  if (search && search.trim()) {
    const escaped = escapeLike(search.trim());
    query = query.ilike("search_text", `%${escaped}%`);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (level) {
    query = query.eq("difficulty", level);
  }

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  // Primary sort, always with secondary score DESC for ties.
  if (sort === "top") {
    query = query
      .order("score", { ascending: false })
      .order("created_at", { ascending: false });
  } else if (sort === "old") {
    query = query
      .order("created_at", { ascending: true })
      .order("score", { ascending: false });
  } else {
    // 'new' (default)
    query = query
      .order("created_at", { ascending: false })
      .order("score", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("queryQuestions failed:", error);
    return { questions: [], total: 0, totalPages: 0, page };
  }

  const rows = (data ?? []) as unknown as Question[];
  const questions = await attachUsernames(supabase, rows);

  const total = count ?? 0;
  return {
    questions,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page,
  };
}

export async function getQuestion(id: string): Promise<Question | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;

  const rows = [data as unknown as Question];
  const [withUsernames] = await attachUsernames(supabase, rows);
  return withUsernames;
}
