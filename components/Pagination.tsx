import Link from "next/link";

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 4) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 3) pages.push("...");
  pages.push(total);
  return pages;
}

function buildHref(page: number, extraParams: Record<string, string>): string {
  const params = new URLSearchParams();
  Object.entries(extraParams).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export default function Pagination({
  currentPage,
  totalPages,
  extraParams = {},
}: {
  currentPage: number;
  totalPages: number;
  extraParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  const linkBase =
    "inline-flex items-center justify-center min-w-9 h-9 px-3 text-sm rounded-lg border transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-1.5 my-8"
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1, extraParams)}
          className={`${linkBase} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
        >
          ← Prev
        </Link>
      ) : (
        <span
          className={`${linkBase} bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed`}
          aria-disabled
        >
          ← Prev
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`gap-${i}`}
            className="inline-flex items-center justify-center min-w-9 h-9 text-gray-500 dark:text-gray-400"
          >
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={`${linkBase} bg-blue-600 border-blue-600 text-white font-semibold`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p, extraParams)}
            className={`${linkBase} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1, extraParams)}
          className={`${linkBase} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700`}
        >
          Next →
        </Link>
      ) : (
        <span
          className={`${linkBase} bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed`}
          aria-disabled
        >
          Next →
        </span>
      )}
    </nav>
  );
}
