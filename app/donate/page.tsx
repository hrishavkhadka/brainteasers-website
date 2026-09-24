import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate · BrainBench",
  description: "Support BrainBench with a donation.",
};

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Support BrainBench
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Donation options coming soon.
        </p>
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to questions
        </Link>
      </div>
    </main>
  );
}
