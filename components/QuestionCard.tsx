"use client";

import { useState } from "react";
import Link from "next/link";
import type { Question } from "@/types/question";
import type { VoteValue } from "@/lib/votes";
import ZoomableImage from "./ZoomableImage";
import VoteButtons from "./VoteButtons";
import ReportButton from "./ReportButton";

const categoryColors: Record<Question["category"], string> = {
  verbal:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  numerical: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  spatial: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  logical:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  pattern:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  memory: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function QuestionCard({
  question,
  userVote = null,
  userId = null,
}: {
  question: Question;
  userVote?: VoteValue | null;
  userId?: string | null;
}) {
  const [visibleHints, setVisibleHints] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const totalHints = question.hints.length;
  const hasMoreHints = visibleHints < totalHints;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full mx-auto mb-4 transition-colors">
      <div className="flex flex-wrap gap-2 mb-3">
        {question.featured && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 flex items-center gap-1">
            <span aria-hidden>★</span> Featured
          </span>
        )}
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[question.category]}`}
        >
          {question.category}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          Level {question.difficulty}/10
        </span>
        {question.qualification && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {question.qualification}
          </span>
        )}
        {question.authorUsername && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            by {question.authorUsername}
          </span>
        )}
      </div>

      <div className="mb-3">
        <VoteButtons
          questionId={question.id}
          initialUpvotes={question.upvotes}
          initialDownvotes={question.downvotes}
          initialUserVote={userVote}
          userId={userId}
        />
      </div>

      {question.question_text && (
        <Link
          href={`/question/${question.id}`}
          className="block text-gray-900 dark:text-gray-100 text-base sm:text-lg mb-3 leading-relaxed whitespace-pre-wrap hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
        >
          {question.question_text}
        </Link>
      )}

      {question.question_image_url && (
        <div className="mb-3 flex justify-center">
          <ZoomableImage
            src={question.question_image_url}
            alt="Question diagram"
            imgClassName="max-h-96 w-auto max-w-full object-contain rounded-lg"
          />
        </div>
      )}

      {visibleHints > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 p-3 mb-3 rounded-r-lg">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-2">
            Hints
          </p>
          {question.hints.slice(0, visibleHints).map((hint, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap">
                {visibleHints > 1 && (
                  <span className="font-semibold mr-1">{i + 1}.</span>
                )}
                {hint.text}
              </p>
              {hint.image_url && (
                <div className="mt-2 flex justify-center">
                  <ZoomableImage
                    src={hint.image_url}
                    alt={`Hint ${i + 1}`}
                    imgClassName="max-h-72 w-auto max-w-full object-contain rounded"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {totalHints > 0 && hasMoreHints && (
          <button
            type="button"
            onClick={() => setVisibleHints((v) => v + 1)}
            className="text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {visibleHints === 0 ? "Show Hint" : "Next Hint"}
            <span className="ml-1 text-amber-100">
              ({visibleHints}/{totalHints})
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowAnswer((s) => !s)}
          className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </button>
      </div>

      {showAnswer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {question.answer_text && (
            <p className="text-base font-semibold text-emerald-800 dark:text-emerald-300 mb-2 whitespace-pre-wrap">
              {question.answer_text}
            </p>
          )}
          {question.answer_image_url && (
            <div className="mb-2 flex justify-center">
              <ZoomableImage
                src={question.answer_image_url}
                alt="Answer"
                imgClassName="max-h-80 w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          )}
          {question.explanation_text && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {question.explanation_text}
            </p>
          )}
          {question.explanation_image_url && (
            <div className="mt-2 flex justify-center">
              <ZoomableImage
                src={question.explanation_image_url}
                alt="Explanation"
                imgClassName="max-h-80 w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {(question.source_text || question.source_url) && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            <span className="font-medium">Source:</span>{" "}
            {question.source_url ? (
              <a
                href={question.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-600 dark:hover:text-gray-300"
              >
                {question.source_text || question.source_url}
              </a>
            ) : (
              <span>{question.source_text}</span>
            )}
          </p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/question/${question.id}`}
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            💬 {question.comment_count}{" "}
            {question.comment_count === 1 ? "comment" : "comments"}
          </Link>
          {userId !== question.author_id && (
            <ReportButton
              targetType="question"
              targetId={question.id}
              userId={userId ?? null}
            />
          )}
        </div>
        <span className="text-gray-400 dark:text-gray-500">
          {new Date(question.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </article>
  );
}
