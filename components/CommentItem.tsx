"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Comment } from "@/types/comment";
import { updateComment, softDeleteComment } from "@/lib/comments-client";
import CommentComposer from "./CommentComposer";
import { useSignInPrompt } from "./auth/SignInPromptProvider";

export default function CommentItem({
  comment,
  replies,
  currentUserId,
  questionId,
  isReply = false,
}: {
  comment: Comment;
  replies?: Comment[];
  currentUserId: string | null;
  questionId: string;
  isReply?: boolean;
}) {
  const router = useRouter();
  const { open } = useSignInPrompt();
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReplyBox, setShowReplyBox] = useState(false);

  const isOwn = currentUserId && comment.author_id === currentUserId;
  const canReply = !isReply && !comment.is_deleted;

  function handleReplyClick() {
    if (!currentUserId) {
      open("Sign in to reply.");
      return;
    }
    setShowReplyBox(true);
  }

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
      <div
        className={`w-8 h-8 rounded-full text-white font-semibold flex items-center justify-center text-xs shrink-0 ${
          comment.is_deleted ? "bg-gray-400 dark:bg-gray-600" : "bg-blue-600"
        }`}
      >
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
          {comment.updated_at !== comment.created_at && !comment.is_deleted && (
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
          <p
            className={`text-sm whitespace-pre-wrap break-words ${
              comment.is_deleted
                ? "italic text-gray-500 dark:text-gray-500"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {comment.body}
          </p>
        )}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}

        {!editing && (
          <div className="flex gap-3 mt-2 text-xs">
            {canReply && (
              <button
                type="button"
                onClick={handleReplyClick}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                Reply
              </button>
            )}
            {isOwn && !comment.is_deleted && (
              <>
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
              </>
            )}
          </div>
        )}

        {/* Inline reply composer */}
        {showReplyBox && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <CommentComposer
              questionId={questionId}
              userId={currentUserId}
              parentId={comment.id}
              placeholder={`Replying to ${comment.authorUsername ?? "user"}...`}
              onDone={() => setShowReplyBox(false)}
              autoFocus
            />
          </div>
        )}

        {/* Replies */}
        {replies && replies.length > 0 && (
          <div className="mt-4 pl-4 sm:pl-6 border-l-2 border-gray-100 dark:border-gray-700/60 flex flex-col gap-4">
            {replies.map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                currentUserId={currentUserId}
                questionId={questionId}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
