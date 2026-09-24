import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-12">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
          <Link
            href="/privacy"
            className="hover:text-gray-700 dark:hover:text-gray-200"
          >
            Privacy
          </Link>
          <Link
            href="/donate"
            className="hover:text-gray-700 dark:hover:text-gray-200"
          >
            Donate
          </Link>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center sm:text-right">
          © {new Date().getFullYear()} BrainBench
        </p>
      </div>
    </footer>
  );
}
