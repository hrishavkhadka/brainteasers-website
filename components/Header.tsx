"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import SearchBar from "./SearchBar";
import { useSignInPrompt } from "./auth/SignInPromptProvider";

type Props = {
  user: { id: string; email: string } | null;
  username: string | null;
  isAdmin: boolean;
};

export default function Header({ user, username, isAdmin }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { open } = useSignInPrompt();

  const currentQuery = searchParams.get("q") ?? "";

  function handleNavClick(e: React.MouseEvent, label: string) {
    if (!user) {
      e.preventDefault();
      open(`Sign in to access ${label}.`);
    }
  }

  const navLinkCls =
    "text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap";

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Row 1 */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-bold text-gray-900 dark:text-gray-100 text-lg shrink-0"
          >
            BrainBench
          </Link>

          {/* Search: desktop only, centered */}
          <div className="hidden md:block flex-1 max-w-md mx-2">
            <SearchBar initialValue={currentQuery} />
          </div>

          <div className="flex items-center gap-2">
            {/* Links: desktop only */}
            <nav className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <Link
                href="/submit"
                className={navLinkCls}
                onClick={(e) => handleNavClick(e, "the submit form")}
              >
                Submit
              </Link>
              <Link
                href="/my-submissions"
                className={navLinkCls}
                onClick={(e) => handleNavClick(e, "your submissions")}
              >
                My submissions
              </Link>
            </nav>

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:inline-block text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Admin
              </Link>
            )}

            {user ? (
              <UserMenu username={username ?? user.email ?? "user"} />
            ) : (
              <button
                type="button"
                onClick={() => open()}
                className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Sign in
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>

        {/* Row 2: mobile search, full width */}
        <div className="mt-2 md:hidden">
          <SearchBar initialValue={currentQuery} />
        </div>

        {/* Row 3: mobile nav links */}
        <div className="mt-2 md:hidden flex items-center gap-1 text-xs">
          <Link
            href="/submit"
            onClick={(e) => handleNavClick(e, "the submit form")}
            className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium"
          >
            Submit
          </Link>
          <Link
            href="/my-submissions"
            onClick={(e) => handleNavClick(e, "your submissions")}
            className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium"
          >
            My submissions
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-medium"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
