import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let admin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
    admin = profile?.is_admin === true;
  }

  const navLinkCls =
    "text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap";

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="font-bold text-gray-900 dark:text-gray-100 text-lg shrink-0"
        >
          IQ Questions
        </Link>

        <div className="flex items-center gap-2">
          {/* Segmented nav: Submit · My submissions */}
          <nav className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <Link href="/submit" className={navLinkCls}>
              Submit
            </Link>
            {user && (
              <Link href="/my-submissions" className={navLinkCls}>
                <span className="hidden sm:inline">My submissions</span>
                <span className="sm:hidden">Mine</span>
              </Link>
            )}
          </nav>

          {/* Admin — separate pill in amber */}
          {admin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Admin
            </Link>
          )}

          {/* Account */}
          {user ? (
            <UserMenu username={username ?? user.email ?? "user"} />
          ) : (
            <Link
              href="/auth"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Sign in
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
