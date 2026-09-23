"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Comment } from "@/types/comment";
import { updateComment, softDeleteComment } from "@/lib/comments-client";

export default function CommentItem({
  comment,
  currentUserId,
}: {
  comment: Comment;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwn = currentUserId && comment.author_id === currentUserId;

  async function handleSaveEdit() {
    setError(null);
    setBusy(true);
    try {
      await updateComment(comment.id, editBody);
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    setError(null);
    setBusy(true);
    try {
      await softDeleteComment(comment.id);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shrink-0">
        {(comment.authorUsername ?? "?").charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {comment.authorUsername ?? "deleted user"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(comment.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {comment.updated_at !== comment.created_at && (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              (edited)
            </span>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-2 mt-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              maxLength={5000}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={busy}
                className="text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg"
              >
                {busy ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditBody(comment.body);
                }}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-1.5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
            {comment.body}
          </p>
        )}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}

        {isOwn && !editing && !comment.is_deleted && (
          <div className="flex gap-3 mt-2 text-xs">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
