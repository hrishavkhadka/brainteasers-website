"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  REPORT_REASON_LABELS,
  submitReport,
  type ReportReason,
  type ReportTargetType,
} from "@/lib/reports-client";
import { useSignInPrompt } from "./auth/SignInPromptProvider";

export default function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  userId: string | null;
}) {
  const router = useRouter();
  const { open: openSignIn } = useSignInPrompt();
  const [reason, setReason] = useState<ReportReason>("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function reset() {
    setReason("spam");
    setDetails("");
    setError(null);
    setSubmitted(false);
    setBusy(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!userId) {
      handleClose();
      openSignIn("Sign in to report content.");
      return;
    }

    setBusy(true);
    try {
      await submitReport({
        reporterId: userId,
        targetType,
        targetId,
        reason,
        details,
      });
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setBusy(false);
    }
  }

  if (!mounted || !open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Report content"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-lg leading-none"
        >
          ×
        </button>

        {submitted ? (
          <div className="py-4 text-center">
            <p className="text-base font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
              Report submitted
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Thanks. A moderator will review it shortly.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 pr-8">
              Report {targetType === "question" ? "question" : "comment"}
            </h2>

            <div>
              <label
                htmlFor="report-reason"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Reason
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.keys(REPORT_REASON_LABELS) as ReportReason[]).map(
                  (r) => (
                    <option key={r} value={r}>
                      {REPORT_REASON_LABELS[r]}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="report-details"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Additional details (optional)
              </label>
              <textarea
                id="report-details"
                rows={3}
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Anything else the moderator should know..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={handleClose}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {busy ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
