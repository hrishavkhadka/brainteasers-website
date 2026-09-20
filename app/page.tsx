import QuestionCard from "@/components/QuestionCard";
import ThemeToggle from "@/components/ThemeToggle";
import { placeholderQuestions } from "@/lib/placeholder-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 transition-colors">
      <div className="max-w-2xl mx-auto mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            IQ Questions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Practice questions across verbal, numerical, spatial, and logical
            reasoning.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        {placeholderQuestions.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
    </main>
  );
}
