export type Hint = {
  text: string;
  image_url: string | null;
};

export type QuestionOption = {
  id: string;
  text: string;
};

export type QuestionFormat = "free_response" | "multiple_choice";

export type Question = {
  id: string;
  question_text: string | null;
  question_image_url: string | null;
  answer_text: string | null;
  answer_image_url: string | null;
  explanation_text: string | null;
  explanation_image_url: string | null;
  hints: Hint[];
  category:
    | "verbal"
    | "numerical"
    | "spatial"
    | "logical"
    | "pattern"
    | "memory";
  difficulty: number;
  qualification: string | null;
  format: QuestionFormat;
  options: QuestionOption[];
  correct_option_id: string | null;
  source_text: string | null; // new
  source_url: string | null; // new
};
