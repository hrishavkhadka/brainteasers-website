"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReportWithContext } from "@/types/report";
import { REPORT_REASON_LABELS } from "@/lib/reports-client";
import { updateReportStatus } from "@/lib/reports-admin";

const statusStyles: Record<string, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  dismissed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  actioned: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

export default function AdminReportsList({
  reports,
  currentStatus,
  adminId,
}: {
  reports: ReportWithContext[];
  currentStatus: string;
  adminId: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(
    reportId: string,
    status: "reviewed" | "dismissed" | "actioned",
    removeTarget = false,
    targetType?: "question" | "comment",
    targetId?: string,
  ) {
    if (removeTarget) {
      const confirmMsg =
        targetType === "question"
          ? "Remove this question? It will no longer appear on the site."
          : 'Remove this comment? It will show as "[removed by moderator]".';
      if (!confirm(confirmMsg)) return;
    }

    setError(null);
    setBusyId(reportId);

    try {
      await updateReportStatus({
        reportId,
        status,
        adminId,
        removeTarget,
        targetType,
        targetId,
      });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No {currentStatus} reports.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-3">
          {error}
        </p>
      )}

      {reports.map((r) => {
        const busy = busyId === r.id;
        const isPending = r.status === "pending";

        return (
          <div
            key={r.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-3"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[r.status]}`}
              >
                {r.status}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {r.target_type}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200">
                {REPORT_REASON_LABELS[r.reason]}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Reported by{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {r.reporterUsername ?? "unknown"}
              </span>
            </p>

            {r.details && (
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                {r.details}
              </div>
            )}

            {/* Target preview */}
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Target content
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {r.target?.text ?? "(unavailable)"}
              </p>
              {r.target && r.target.exists && (
                <Link
                  href={r.target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-block mt-2"
                >
                  View on site →
                </Link>
              )}
              {r.target?.isRemoved && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                  Already removed.
                </p>
              )}
            </div>

            {/* Actions */}
            {isPending ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAction(r.id, "dismissed")}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAction(r.id, "reviewed")}
                  className="text-sm px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/60 disabled:opacity-60"
                >
                  Mark reviewed
                </button>
                {r.target && !r.target.isRemoved && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      handleAction(
                        r.id,
                        "actioned",
                        true,
                        r.target_type,
                        r.target_id,
                      )
                    }
                    className="text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-60"
                  >
                    {busy ? "Working..." : "Action & remove"}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Resolved. Report closed.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
