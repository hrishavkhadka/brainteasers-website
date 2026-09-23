"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComment } from "@/lib/comments-client";
import { useSignInPrompt } from "./auth/SignInPromptProvider";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function CommentComposer({
  questionId,
  userId,
  parentId = null,
  placeholder = "Share your thoughts...",
  onDone,
  autoFocus = false,
}: {
  questionId: string;
  userId: string | null;
  parentId?: string | null;
  placeholder?: string;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const { open } = useSignInPrompt();
  const { flags } = useSiteSettings();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paused = flags.comments_paused;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!userId) {
      open("Sign in to comment.");
      return;
    }

    if (paused) {
      setError("Comments are paused at the moment. Please try again later.");
      return;
    }

    if (!body.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    setError(null);
    setBusy(true);

    try {
      await createComment({ questionId, userId, body, parentId });
      setBody("");
      router.refresh();
      onDone?.();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to post comment.";
      if (
        msg.toLowerCase().includes("row-level security") ||
        msg.includes("violates row-level")
      ) {
        setError("Comments are paused at the moment. Please try again later.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  if (paused) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Comments are paused at the moment. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
        maxLength={5000}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {body.length}/5000
        </span>
        <div className="flex gap-2">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1.5"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={busy}
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            {busy ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}
