"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { QuestionStatus } from "@/types/question";

const statusStyles: Record<QuestionStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  removed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const statusLabels: Record<QuestionStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  published: "Published",
  rejected: "Rejected",
  removed: "Removed",
};

export default function AdminUserQuestionRow({
  question,
}: {
  question: {
    id: string;
    created_at: string;
    question_text: string | null;
    question_image_url: string | null;
    category: string;
    difficulty: number;
    status: QuestionStatus;
    upvotes: number;
    downvotes: number;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    if (
      !confirm(
        'Remove this question? The author will see it as "Removed by moderator".',
      )
    ) {
      return;
    }
    setError(null);
    setBusy(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("questions")
      .update({
        status: "removed",
        removed_at: new Date().toISOString(),
      })
      .eq("id", question.id);

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function handleRestore() {
    if (!confirm("Restore this question to published status?")) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("questions")
      .update({ status: "published", removed_at: null })
      .eq("id", question.id);

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  const isRemoved = question.status === "removed";

  return (
    <div
      className={`bg-white dark:bg-gray-800 border rounded-xl p-4 mb-3 ${
        isRemoved
          ? "border-red-200 dark:border-red-900/40 opacity-80"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[question.status]}`}
        >
          {statusLabels[question.status]}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {question.category}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          Level {question.difficulty}/10
        </span>
        <span className="text-xs text-emerald-700 dark:text-emerald-400">
          ▲ {question.upvotes}
        </span>
        <span className="text-xs text-red-700 dark:text-red-400">
          ▼ {question.downvotes}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
          {new Date(question.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
        {question.question_text ?? "(image only)"}
      </p>
      {question.question_image_url && (
        <img
          src={question.question_image_url}
          alt=""
          className="max-h-32 rounded mt-2 border border-gray-200 dark:border-gray-700"
        />
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}

      <div className="flex justify-end mt-3">
        {isRemoved ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleRestore}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium"
          >
            {busy ? "Restoring..." : "Restore"}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={handleRemove}
            className="text-xs px-3 py-1.5 rounded-lg text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 hover:bg-red-900/10 dark:hover:bg-red-900/30 disabled:opacity-60"
          >
            {busy ? "Removing..." : "Remove"}
          </button>
        )}
      </div>
    </div>
  );
}
