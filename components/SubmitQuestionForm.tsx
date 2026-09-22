"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ImageUpload from "./ImageUpload";

const CATEGORIES = [
  "verbal",
  "numerical",
  "spatial",
  "logical",
  "pattern",
  "memory",
] as const;

type Category = (typeof CATEGORIES)[number];
type Format = "free_response" | "multiple_choice";

type HintDraft = { text: string; image_url: string | null };
type OptionDraft = { id: string; text: string };

const OPTION_IDS = ["a", "b", "c", "d"];

export default function SubmitQuestionForm({ userId }: { userId: string }) {
  const router = useRouter();

  // Question
  const [questionText, setQuestionText] = useState("");
  const [questionImage, setQuestionImage] = useState<string | null>(null);

  // Answer + explanation
  const [answerText, setAnswerText] = useState("");
  const [answerImage, setAnswerImage] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState("");
  const [explanationImage, setExplanationImage] = useState<string | null>(null);

  // Hints
  const [hints, setHints] = useState<HintDraft[]>([]);

  // Metadata
  const [category, setCategory] = useState<Category>("logical");
  const [difficulty, setDifficulty] = useState(1);
  const [qualification, setQualification] = useState("");

  // Format
  const [format, setFormat] = useState<Format>("free_response");
  const [options, setOptions] = useState<OptionDraft[]>([
    { id: "a", text: "" },
    { id: "b", text: "" },
    { id: "c", text: "" },
    { id: "d", text: "" },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState<string>("a");

  // Source
  const [sourceText, setSourceText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function addHint() {
    setHints((h) => [...h, { text: "", image_url: null }]);
  }

  function updateHint(index: number, patch: Partial<HintDraft>) {
    setHints((h) =>
      h.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeHint(index: number) {
    setHints((h) => h.filter((_, i) => i !== index));
  }

  function updateOption(id: string, text: string) {
    setOptions((opts) => opts.map((o) => (o.id === id ? { ...o, text } : o)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!questionText.trim() && !questionImage) {
      setError("Add a question text or image.");
      return;
    }
    if (!answerText.trim() && !answerImage) {
      setError("Add an answer text or image.");
      return;
    }
    if (format === "multiple_choice") {
      const filled = options.filter((o) => o.text.trim());
      if (filled.length < 2) {
        setError("Multiple choice needs at least 2 filled options.");
        return;
      }
      if (!filled.some((o) => o.id === correctOptionId)) {
        setError("The correct option must be one of the filled options.");
        return;
      }
    }

    setSubmitting(true);
    const supabase = createClient();

    const cleanedHints = hints
      .filter((h) => h.text.trim() || h.image_url)
      .map((h) => ({ text: h.text.trim(), image_url: h.image_url }));

    const cleanedOptions =
      format === "multiple_choice"
        ? options
            .filter((o) => o.text.trim())
            .map((o) => ({ id: o.id, text: o.text.trim() }))
        : [];

    const { error: insertError } = await supabase.from("questions").insert({
      author_id: userId,
      question_text: questionText.trim() || null,
      question_image_url: questionImage,
      answer_text: answerText.trim() || null,
      answer_image_url: answerImage,
      explanation_text: explanationText.trim() || null,
      explanation_image_url: explanationImage,
      hints: cleanedHints,
      category,
      difficulty,
      qualification: qualification.trim() || null,
      format,
      options: cleanedOptions,
      correct_option_id: format === "multiple_choice" ? correctOptionId : null,
      source_text: sourceText.trim() || null,
      source_url: sourceUrl.trim() || null,
      status: "pending",
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
        <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
          Submitted for review
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Your question has been saved. It will appear on the site once
          approved.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Back to questions
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const sectionCls =
    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4";
  const sectionTitleCls =
    "text-base font-semibold text-gray-900 dark:text-gray-100 mb-4";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Question */}
      <section className={sectionCls}>
        <h2 className={sectionTitleCls}>Question</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls} htmlFor="questionText">
              Question text
            </label>
            <textarea
              id="questionText"
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className={inputCls}
              placeholder="Type the question..."
            />
          </div>
          <ImageUpload
            label="Question image (optional)"
            value={questionImage}
            onChange={setQuestionImage}
            userId={userId}
          />
        </div>
      </section>

      {/* Category + difficulty */}
      <section className={sectionCls}>
        <h2 className={sectionTitleCls}>Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} htmlFor="category">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="difficulty">
              Difficulty (1–5)
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className={inputCls}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="qualification">
              Qualification
            </label>
            <input
              id="qualification"
              type="text"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="e.g. High school math"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Answer format */}
      <section className={sectionCls}>
        <h2 className={sectionTitleCls}>Answer format</h2>
        <div className="flex gap-4 mb-4">
          {(["free_response", "multiple_choice"] as Format[]).map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="format"
                checked={format === f}
                onChange={() => setFormat(f)}
              />
              <span className="text-gray-800 dark:text-gray-200">
                {f === "free_response" ? "Free response" : "Multiple choice"}
              </span>
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls} htmlFor="answerText">
              Answer text
            </label>
            <input
              id="answerText"
              type="text"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className={inputCls}
              placeholder="The correct answer..."
            />
          </div>
          <ImageUpload
            label="Answer image (optional)"
            value={answerImage}
            onChange={setAnswerImage}
            userId={userId}
          />
        </div>

        {format === "multiple_choice" && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Options (leave blank to use fewer than 4)
            </p>
            <div className="flex flex-col gap-2">
              {options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctOptionId === opt.id}
                    onChange={() => setCorrectOptionId(opt.id)}
                    title="Mark as correct"
                  />
                  <span className="w-6 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
                    {opt.id}.
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(opt.id, e.target.value)}
                    placeholder={`Option ${opt.id.toUpperCase()}`}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Radio on the left marks which option is correct.
            </p>
          </div>
        )}
      </section>

      {/* Explanation */}
      <section className={sectionCls}>
        <h2 className={sectionTitleCls}>Explanation (optional)</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls} htmlFor="explanationText">
              Explanation text
            </label>
            <textarea
              id="explanationText"
              rows={3}
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              className={inputCls}
              placeholder="Why is the answer correct?"
            />
          </div>
          <ImageUpload
            label="Explanation image (optional)"
            value={explanationImage}
            onChange={setExplanationImage}
            userId={userId}
          />
        </div>
      </section>

      {/* Hints */}
      <section className={sectionCls}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={`${sectionTitleCls} mb-0`}>Hints (optional)</h2>
          <button
            type="button"
            onClick={addHint}
            className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            + Add hint
          </button>
        </div>
        {hints.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hints yet. Add one or more — they'll be revealed to users one at
            a time.
          </p>
        )}
        <div className="flex flex-col gap-4">
          {hints.map((hint, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Hint {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeHint(i)}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove
                </button>
              </div>
              <textarea
                rows={2}
                value={hint.text}
                onChange={(e) => updateHint(i, { text: e.target.value })}
                className={`${inputCls} mb-3`}
                placeholder="Hint text..."
              />
              <ImageUpload
                label="Hint image (optional)"
                value={hint.image_url}
                onChange={(url) => updateHint(i, { image_url: url })}
                userId={userId}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Source */}
      <section className={sectionCls}>
        <h2 className={sectionTitleCls}>Source (optional)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="sourceText">
              Source label
            </label>
            <input
              id="sourceText"
              type="text"
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="e.g. Adapted from..."
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="sourceUrl">
              Source URL
            </label>
            <input
              id="sourceUrl"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {submitting ? "Submitting..." : "Submit for review"}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        Submitted questions are reviewed before appearing publicly.
      </p>
    </form>
  );
}
