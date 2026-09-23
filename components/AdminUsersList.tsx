"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserStat = {
  id: string;
  username: string;
  email: string | null;
  is_admin: boolean;
  can_submit: boolean;
  created_at: string;
  submissions_count: number;
  pending_count: number;
  published_count: number;
  rejected_count: number;
  total_upvotes: number;
  total_downvotes: number;
};

export default function AdminUsersList({ users }: { users: UserStat[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleCanSubmit(userId: string, next: boolean) {
    setError(null);
    setBusyId(userId);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({ can_submit: next })
      .eq("id", userId)
      .select("id, can_submit")
      .single();

    setBusyId(null);

    if (error) {
      setError(error.message);
      return;
    }
    if (!data || data.can_submit !== next) {
      setError("Update was blocked. Check RLS policies.");
      return;
    }
    router.refresh();
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No users yet.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mb-3">
          {error}
        </p>
      )}

      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Submissions</th>
              <th className="px-4 py-3">Votes</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Can submit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-100 dark:border-gray-700/60 last:border-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {u.username}
                  </Link>
                  {u.is_admin && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                      admin
                    </span>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[16rem]">
                    {u.email ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-900 dark:text-gray-100">
                    {u.submissions_count} total
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {u.published_count} pub · {u.pending_count} pend ·{" "}
                    {u.rejected_count} rej
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-emerald-700 dark:text-emerald-400 text-xs">
                    ▲ {u.total_upvotes}
                  </p>
                  <p className="text-red-700 dark:text-red-400 text-xs">
                    ▼ {u.total_downvotes}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={u.can_submit}
                      disabled={busyId === u.id || u.is_admin}
                      onChange={(e) => toggleCanSubmit(u.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-emerald-500 peer-disabled:opacity-50 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <Link
                href={`/admin/users/${u.id}`}
                className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {u.username}
                {u.is_admin && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                    admin
                  </span>
                )}
              </Link>
              <label className="inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={u.can_submit}
                  disabled={busyId === u.id || u.is_admin}
                  onChange={(e) => toggleCanSubmit(u.id, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-emerald-500 peer-disabled:opacity-50 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
              {u.email ?? "—"}
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Subs</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {u.submissions_count}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Up</p>
                <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                  {u.total_upvotes}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Down</p>
                <p className="text-red-700 dark:text-red-400 font-medium">
                  {u.total_downvotes}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
