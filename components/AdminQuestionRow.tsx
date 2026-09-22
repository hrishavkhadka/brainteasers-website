"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Question } from "@/types/question";

export default function AdminQuestionRow({
  question,
  authorUsername,
}: {
  question: Question;
  authorUsername: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function approve() {
    setError(null);
    setBusy("approve");
    const supabase = createClient();

    const { error } = await supabase
      .from("questions")
      .update({ status: "published", rejection_reason: null })
      .eq("id", question.id);

    setBusy(null);

    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  async function confirmReject() {
    setError(null);
    setBusy("reject");
    const supabase = createClient();

    const { error } = await supabase
      .from("questions")
      .update({
        status: "rejected",
        rejection_reason: reason.trim() || null,
      })
      .eq("id", question.id);

    setBusy(null);

    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-3">
      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {question.category}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          Level {question.difficulty}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
          {question.format === "multiple_choice" ? "MCQ" : "Free response"}
        </span>
        {authorUsername && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            by {authorUsername}
          </span>
        )}
      </div>

      {/* Question preview */}
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-2 whitespace-pre-wrap">
        {question.question_text ?? "(no text)"}
      </p>
      {question.question_image_url && (
        <img
          src={question.question_image_url}
          alt="Question"
          className="max-h-40 rounded-lg mb-2 border border-gray-200 dark:border-gray-700"
        />
      )}

      {/* Expandable details */}
      {preview && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm">
          <p className="text-gray-700 dark:text-gray-300 mb-1">
            <span className="font-semibold">Answer:</span>{" "}
            {question.answer_text ?? "(none)"}
          </p>
          {question.answer_image_url && (
            <img
              src={question.answer_image_url}
              alt="Answer"
              className="max-h-32 rounded border border-gray-200 dark:border-gray-700 mb-2"
            />
          )}
          {question.format === "multiple_choice" &&
            question.options.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Options:
                </span>
                <ul className="list-disc pl-5 mt-1 text-gray-600 dark:text-gray-400">
                  {question.options.map((o) => (
                    <li key={o.id}>
                      <span className="font-medium uppercase">{o.id}.</span>{" "}
                      {o.text}
                      {o.id === question.correct_option_id && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {" "}
                          ← correct
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          {question.explanation_text && (
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              <span className="font-semibold">Explanation:</span>{" "}
              {question.explanation_text}
            </p>
          )}
          {question.hints.length > 0 && (
            <div className="mt-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Hints:
              </span>
              <ol className="list-decimal pl-5 mt-1 text-gray-600 dark:text-gray-400">
                {question.hints.map((h, i) => (
                  <li key={i}>{h.text}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3">
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}

        {rejecting && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40">
            <label className="block text-xs font-medium text-red-800 dark:text-red-300 mb-1">
              Reason for rejection (optional — the author will see this)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate of an existing question, or answer needs clarification."
              className="w-full px-2 py-1.5 text-sm rounded border border-red-300 dark:border-red-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {preview ? "Hide details" : "Show details"}
          </button>

          <button
            type="button"
            disabled={busy !== null}
            onClick={approve}
            className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium"
          >
            {busy === "approve" ? "Approving..." : "Approve"}
          </button>

          {!rejecting ? (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => setRejecting(true)}
              className="text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium"
            >
              Reject
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={busy !== null}
                onClick={confirmReject}
                className="text-sm px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium"
              >
                {busy === "reject" ? "Rejecting..." : "Confirm reject"}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => {
                  setRejecting(false);
                  setReason("");
                }}
                className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
