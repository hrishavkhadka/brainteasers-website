"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { useSignInPrompt } from "./auth/SignInPromptProvider";

type Props = {
  user: { id: string; email: string } | null;
  username: string | null;
  isAdmin: boolean;
};

export default function Header({ user, username, isAdmin }: Props) {
  const router = useRouter();
  const { open } = useSignInPrompt();

  function handleNavClick(e: React.MouseEvent, path: string, label: string) {
    if (!user) {
      e.preventDefault();
      open(`Sign in to access ${label}.`);
    }
  }

  const navLinkCls =
    "text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap";

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="font-bold text-gray-900 dark:text-gray-100 text-lg shrink-0"
        >
          BrainBench
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <Link
              href="/submit"
              className={navLinkCls}
              onClick={(e) => handleNavClick(e, "/submit", "the submit form")}
            >
              Submit
            </Link>
            <Link
              href="/my-submissions"
              className={navLinkCls}
              onClick={(e) =>
                handleNavClick(e, "/my-submissions", "your submissions")
              }
            >
              <span className="hidden sm:inline">My submissions</span>
              <span className="sm:hidden">Mine</span>
            </Link>
          </nav>

          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
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
    </header>
  );
}
