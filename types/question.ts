export type Hint = {
  text: string;
  image_url: string | null;
};

export type QuestionStatus = "draft" | "pending" | "published" | "rejected";
export type QuestionCategory =
  | "verbal"
  | "numerical"
  | "spatial"
  | "logical"
  | "pattern"
  | "memory";

export type Question = {
  id: string;
  author_id: string | null;
  created_at: string;
  question_text: string | null;
  question_image_url: string | null;
  answer_text: string | null;
  answer_image_url: string | null;
  explanation_text: string | null;
  explanation_image_url: string | null;
  hints: Hint[];
  category: QuestionCategory;
  difficulty: number;
  qualification: string | null;
  source_text: string | null;
  source_url: string | null;
  status: QuestionStatus;
  rejection_reason: string | null;
  featured: boolean;
  featured_order: number | null;
};
