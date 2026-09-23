import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { getReports, getReportCounts } from "@/lib/reports-server";
import AdminReportsList from "@/components/AdminReportsList";
import type { ReportStatus } from "@/types/report";

export const dynamic = "force-dynamic";

const TABS: { key: ReportStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "actioned", label: "Actioned" },
  { key: "dismissed", label: "Dismissed" },
];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!(await isAdmin())) {
    redirect("/");
  }

  const params = await searchParams;
  const requested = params.status as ReportStatus | undefined;
  const currentStatus: ReportStatus =
    requested && TABS.some((t) => t.key === requested) ? requested : "pending";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [reports, counts] = await Promise.all([
    getReports(currentStatus),
    getReportCounts(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4">
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Admin · Reports
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review reported content and take action.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Pending questions
            </Link>
            <Link
              href="/admin/users"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Users →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
          {TABS.map((tab) => {
            const isActive = tab.key === currentStatus;
            const count = counts[tab.key] ?? 0;
            return (
              <Link
                key={tab.key}
                href={`/admin/reports?status=${tab.key}`}
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-xs ${
                    isActive
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <AdminReportsList
          reports={reports}
          currentStatus={currentStatus}
          adminId={user?.id ?? ""}
        />
      </div>
    </main>
  );
}
