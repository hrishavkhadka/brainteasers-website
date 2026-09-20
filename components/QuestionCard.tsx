"use client";

import { useState } from "react";
import { Question } from "@/types/question";

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

export default function QuestionCard({ question }: { question: Question }) {
  const [visibleHints, setVisibleHints] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const totalHints = question.hints.length;
  const hasMoreHints = visibleHints < totalHints;
  const isMCQ =
    question.format === "multiple_choice" && question.options.length > 0;
  const correctId = question.correct_option_id;

  function optionClasses(optionId: string) {
    const base =
      "w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm sm:text-base flex items-center justify-between gap-2";
    const idle =
      "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500";
    const selected =
      "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 text-blue-900 dark:text-blue-100";
    const correct =
      "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-500 text-emerald-900 dark:text-emerald-100";
    const wrong =
      "bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-500 text-red-900 dark:text-red-100";

    if (!showAnswer) {
      return `${base} ${selectedOption === optionId ? selected : idle}`;
    }
    if (optionId === correctId) return `${base} ${correct}`;
    if (optionId === selectedOption) return `${base} ${wrong}`;
    return `${base} ${idle} opacity-60`;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-5 max-w-2xl w-full mx-auto mb-4 transition-colors">
      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[question.category]}`}
        >
          {question.category}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          Level {question.difficulty}
        </span>
        {question.qualification && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {question.qualification}
          </span>
        )}
      </div>

      {/* Question */}
      {question.question_text && (
        <p className="text-gray-900 dark:text-gray-100 text-base sm:text-lg mb-3 leading-relaxed">
          {question.question_text}
        </p>
      )}
      {question.question_image_url && (
        <img
          src={question.question_image_url}
          alt="Question diagram"
          className="rounded-lg mb-3 w-full"
          loading="lazy"
        />
      )}

      {/* MCQ options */}
      {isMCQ && (
        <div className="flex flex-col gap-2 mb-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={showAnswer}
              onClick={() => setSelectedOption(opt.id)}
              className={optionClasses(opt.id)}
            >
              <span>
                <span className="font-semibold mr-2 uppercase">{opt.id}.</span>
                {opt.text}
              </span>
              {showAnswer && opt.id === correctId && (
                <span
                  aria-label="correct"
                  className="text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  ✓
                </span>
              )}
              {showAnswer &&
                opt.id === selectedOption &&
                opt.id !== correctId && (
                  <span
                    aria-label="incorrect"
                    className="text-red-600 dark:text-red-400 font-bold"
                  >
                    ✗
                  </span>
                )}
            </button>
          ))}
        </div>
      )}

      {/* Hints */}
      {visibleHints > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 p-3 mb-3 rounded-r-lg">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-2">
            Hints
          </p>
          {question.hints.slice(0, visibleHints).map((hint, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                {visibleHints > 1 && (
                  <span className="font-semibold mr-1">{i + 1}.</span>
                )}
                {hint.text}
              </p>
              {hint.image_url && (
                <img
                  src={hint.image_url}
                  alt={`Hint ${i + 1}`}
                  className="rounded mt-2 w-full"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
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

      {/* Answer + Explanation */}
      {showAnswer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {question.answer_text && (
            <p className="text-base font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
              {question.answer_text}
            </p>
          )}
          {question.answer_image_url && (
            <img
              src={question.answer_image_url}
              alt="Answer"
              className="rounded-lg mb-2 w-full"
              loading="lazy"
            />
          )}
          {question.explanation_text && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {question.explanation_text}
            </p>
          )}
          {question.explanation_image_url && (
            <img
              src={question.explanation_image_url}
              alt="Explanation"
              className="rounded-lg mt-2 w-full"
              loading="lazy"
            />
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
    </div>
  );
}
