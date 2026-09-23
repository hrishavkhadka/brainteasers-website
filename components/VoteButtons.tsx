"use client";

import { useState } from "react";
import { castVote, removeVote, type VoteValue } from "@/lib/votes";
import { useSignInPrompt } from "./auth/SignInPromptProvider";

export default function VoteButtons({
  questionId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  userId,
}: {
  questionId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote: VoteValue | null;
  userId: string | null;
}) {
  const { open } = useSignInPrompt();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<VoteValue | null>(initialUserVote);
  const [busy, setBusy] = useState(false);

  async function handleVote(clicked: VoteValue) {
    if (!userId) {
      open("Sign in to vote on questions.");
      return;
    }
    if (busy) return;

    const prevUp = upvotes;
    const prevDown = downvotes;
    const prevUserVote = userVote;

    // Optimistic update
    let nextUserVote: VoteValue | null;
    if (userVote === clicked) {
      // Clicking same direction retracts
      nextUserVote = null;
      if (clicked === 1) setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else if (userVote === null) {
      // No prior vote — add new
      nextUserVote = clicked;
      if (clicked === 1) setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    } else {
      // Switching direction
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
        await removeVote(questionId, userId);
      } else {
        await castVote(questionId, userId, nextUserVote);
      }
    } catch (e) {
      // Revert on failure
      setUpvotes(prevUp);
      setDownvotes(prevDown);
      setUserVote(prevUserVote);
      console.error("Vote failed:", e);
    } finally {
      setBusy(false);
    }
  }

  const score = upvotes - downvotes;

  const baseBtn =
    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors border";

  const upActive =
    "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300";
  const downActive =
    "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300";
  const inactive =
    "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={busy}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
        className={`${baseBtn} ${userVote === 1 ? upActive : inactive} disabled:opacity-70`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        <span>{upvotes}</span>
      </button>

      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={busy}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
        className={`${baseBtn} ${userVote === -1 ? downActive : inactive} disabled:opacity-70`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
        <span>{downvotes}</span>
      </button>

      <span
        className="text-xs text-gray-500 dark:text-gray-400 ml-1"
        aria-label={`Score ${score}`}
      >
        ({score >= 0 ? "+" : ""}
        {score})
      </span>
    </div>
  );
}
