export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-6 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4 animate-pulse"
          >
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}
