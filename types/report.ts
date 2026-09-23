export type ReportStatus = "pending" | "reviewed" | "dismissed" | "actioned";

export type ReportReason =
  | "spam"
  | "incorrect"
  | "offensive"
  | "duplicate"
  | "off_topic"
  | "other";

export type ReportTargetType = "question" | "comment";

export type Report = {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type TargetPreview = {
  /** Truncated text from the target for display */
  text: string;
  /** Link to view the target on the public site */
  href: string;
  /** Whether the target still exists and is visible */
  exists: boolean;
  /** Already removed/deleted */
  isRemoved: boolean;
};

export type ReportWithContext = Report & {
  reporterUsername: string | null;
  target: TargetPreview | null;
};
