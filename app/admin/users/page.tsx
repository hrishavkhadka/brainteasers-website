import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import AdminUsersList from "@/components/AdminUsersList";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  if (!(await isAdmin())) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: users, error } = await supabase.rpc("get_user_stats");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Admin · Users
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {users?.length ?? 0} registered{" "}
              {(users?.length ?? 0) === 1 ? "user" : "users"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Pending questions
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {error ? (
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/40 rounded-xl p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load users: {error.message}
            </p>
          </div>
        ) : (
          <AdminUsersList users={users ?? []} />
        )}
      </div>
    </main>
  );
}
