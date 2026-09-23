"use client";

import { createClient } from "@/lib/supabase/client";

export async function updateReportStatus({
  reportId,
  status,
  adminId,
  removeTarget,
  targetType,
  targetId,
}: {
  reportId: string;
  status: "reviewed" | "dismissed" | "actioned";
  adminId: string;
  removeTarget?: boolean;
  targetType?: "question" | "comment";
  targetId?: string;
}): Promise<void> {
  const supabase = createClient();

  if (removeTarget && targetType && targetId) {
    if (targetType === "question") {
      const { error } = await supabase
        .from("questions")
        .update({
          status: "removed",
          removed_at: new Date().toISOString(),
        })
        .eq("id", targetId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("comments")
        .update({
          is_deleted: true,
          deleted_by: adminId,
          body: "[removed by moderator]",
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetId);
      if (error) throw error;
    }
  }

  const { error } = await supabase
    .from("reports")
    .update({
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  if (error) throw error;
}
