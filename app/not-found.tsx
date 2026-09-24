import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md text-center">
        <p className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-2">
          404
        </p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Page not found
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist, or the question
          may have been removed.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Back to questions
        </Link>
      </div>
    </main>
  );
}
