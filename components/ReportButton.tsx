"use client";

import { useState } from "react";
import ReportModal from "./ReportModal";
import type { ReportTargetType } from "@/lib/reports-client";

export default function ReportButton({
  targetType,
  targetId,
  userId,
  className = "",
}: {
  targetType: ReportTargetType;
  targetId: string;
  userId: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        }
      >
        Report
      </button>
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
        userId={userId}
      />
    </>
  );
}
