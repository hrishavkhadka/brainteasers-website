"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error.message}
        </p>
        <button
          type="button"
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
