export type Comment = {
  id: string;
  question_id: string;
  author_id: string | null;
  parent_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  upvotes: number;
  downvotes: number;
  /** Computed at fetch time. Not a DB column. */
  authorUsername?: string | null;
};
