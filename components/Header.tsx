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

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="font-bold text-gray-900 dark:text-gray-100 text-lg shrink-0"
        >
          IQ Questions
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/submit"
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1"
          >
            Submit
          </Link>
          {admin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 px-2 py-1"
            >
              Admin
            </Link>
          )}
          {user ? (
            <UserMenu username={username ?? user.email ?? "user"} />
          ) : (
            <Link
              href="/auth"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
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
