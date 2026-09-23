import { createClient } from "@/lib/supabase/server";
import type {
  Report,
  ReportStatus,
  ReportWithContext,
  TargetPreview,
} from "@/types/report";

function previewText(text: string | null, max = 180): string {
  if (!text) return "(image only)";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

export async function getReportCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_report_counts");

  const counts: Record<string, number> = {
    pending: 0,
    reviewed: 0,
    dismissed: 0,
    actioned: 0,
  };
  data?.forEach((row: { status: string; cnt: number }) => {
    counts[row.status] = Number(row.cnt);
  });
  return counts;
}

export async function getReports(
  status: ReportStatus,
): Promise<ReportWithContext[]> {
  const supabase = await createClient();

  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error || !reports || reports.length === 0) return [];

  const rows = reports as Report[];

  // Reporter usernames
  const reporterIds = Array.from(new Set(rows.map((r) => r.reporter_id)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", reporterIds);
  const usernameMap = new Map<string, string>(
    profiles?.map((p) => [p.id, p.username]) ?? [],
  );

  // Targets
  const questionIds = rows
    .filter((r) => r.target_type === "question")
    .map((r) => r.target_id);
  const commentIds = rows
    .filter((r) => r.target_type === "comment")
    .map((r) => r.target_id);

  const [questionsRes, commentsRes] = await Promise.all([
    questionIds.length > 0
      ? supabase
          .from("questions")
          .select("id, question_text, status")
          .in("id", questionIds)
      : Promise.resolve({
          data: [] as {
            id: string;
            question_text: string | null;
            status: string;
          }[],
        }),
    commentIds.length > 0
      ? supabase
          .from("comments")
          .select("id, question_id, body, is_deleted")
          .in("id", commentIds)
      : Promise.resolve({
          data: [] as {
            id: string;
            question_id: string;
            body: string;
            is_deleted: boolean;
          }[],
        }),
  ]);

  const questionMap = new Map<
    string,
    { text: string | null; status: string }
  >();
  questionsRes.data?.forEach((q) => {
    questionMap.set(q.id, { text: q.question_text, status: q.status });
  });

  const commentMap = new Map<
    string,
    { questionId: string; body: string; isDeleted: boolean }
  >();
  commentsRes.data?.forEach((c) => {
    commentMap.set(c.id, {
      questionId: c.question_id,
      body: c.body,
      isDeleted: c.is_deleted,
    });
  });

  return rows.map((r) => {
    let target: TargetPreview | null = null;

    if (r.target_type === "question") {
      const q = questionMap.get(r.target_id);
      if (q) {
        const isRemoved = q.status === "removed";
        target = {
          text: previewText(q.text),
          href: `/question/${r.target_id}`,
          exists: !isRemoved,
          isRemoved,
        };
      } else {
        target = {
          text: "(question no longer exists)",
          href: "#",
          exists: false,
          isRemoved: true,
        };
      }
    } else {
      const c = commentMap.get(r.target_id);
      if (c) {
        target = {
          text: previewText(c.body),
          href: `/question/${c.questionId}#comment-${r.target_id}`,
          exists: !c.isDeleted,
          isRemoved: c.isDeleted,
        };
      } else {
        target = {
          text: "(comment no longer exists)",
          href: "#",
          exists: false,
          isRemoved: true,
        };
      }
    }

    return {
      ...r,
      reporterUsername: usernameMap.get(r.reporter_id) ?? null,
      target,
    };
  });
}
