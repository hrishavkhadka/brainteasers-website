"use client";

import { useState } from "react";
import {
  castCommentVote,
  removeCommentVote,
  type VoteValue,
} from "@/lib/comment-votes";
import { useSignInPrompt } from "./auth/SignInPromptProvider";

export default function CommentVoteButtons({
  commentId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  userId,
  disabled = false,
}: {
  commentId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: VoteValue | null;
  userId: string | null;
  disabled?: boolean;
}) {
  const { open } = useSignInPrompt();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<VoteValue | null>(initialUserVote);
  const [busy, setBusy] = useState(false);

  async function handleVote(clicked: VoteValue) {
    if (!userId) {
      open("Sign in to vote.");
      return;
    }
    if (busy || disabled) return;

    const prevUp = upvotes;
    const prevDown = downvotes;
    const prevUserVote = userVote;

    let nextUserVote: VoteValue | null;
    if (userVote === clicked) {
      nextUserVote = null;
      if (clicked === 1) setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else if (userVote === null) {
      nextUserVote = clicked;
      if (clicked === 1) setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    } else {
      nextUserVote = clicked;
      if (clicked === 1) {
        setUpvotes((v) => v + 1);
        setDownvotes((v) => v - 1);
      } else {
        setUpvotes((v) => v - 1);
        setDownvotes((v) => v + 1);
      }
    }
    setUserVote(nextUserVote);
    setBusy(true);

    try {
      if (nextUserVote === null) {
        await removeCommentVote(commentId, userId);
      } else {
        await castCommentVote(commentId, userId, nextUserVote);
      }
    } catch (e) {
      setUpvotes(prevUp);
      setDownvotes(prevDown);
      setUserVote(prevUserVote);
      console.error("Comment vote failed:", e);
    } finally {
      setBusy(false);
    }
  }

  const baseBtn =
    "flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors";
  const upActive = "text-emerald-700 dark:text-emerald-400 font-semibold";
  const downActive = "text-red-700 dark:text-red-400 font-semibold";
  const inactive =
    "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200";
  const disabledCls = "opacity-50 cursor-not-allowed";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={busy || disabled}
        aria-label="Upvote comment"
        aria-pressed={userVote === 1}
        className={`${baseBtn} ${userVote === 1 ? upActive : inactive} ${disabled ? disabledCls : ""}`}
      >
        ▲ <span>{upvotes}</span>
      </button>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={busy || disabled}
        aria-label="Downvote comment"
        aria-pressed={userVote === -1}
        className={`${baseBtn} ${userVote === -1 ? downActive : inactive} ${disabled ? disabledCls : ""}`}
      >
        ▼ <span>{downvotes}</span>
      </button>
    </div>
  );
}
