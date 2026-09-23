"use client";

import { createClient } from "@/lib/supabase/client";

export type ReportReason =
  | "spam"
  | "incorrect"
  | "offensive"
  | "duplicate"
  | "off_topic"
  | "other";

export type ReportTargetType = "question" | "comment";

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam",
  incorrect: "Incorrect answer or content",
  offensive: "Offensive or inappropriate",
  duplicate: "Duplicate",
  off_topic: "Off topic",
  other: "Other",
};

export async function submitReport({
  reporterId,
  targetType,
  targetId,
  reason,
  details,
}: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("reports").insert({
    reporter_id: reporterId,
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details?.trim() || null,
  });

  if (error) {
    // Unique violation = already reported
    if (error.code === "23505") {
      throw new Error("You've already reported this.");
    }
    throw error;
  }
}
