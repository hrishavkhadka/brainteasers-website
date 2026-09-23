"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SettingKey = "submissions_paused" | "signups_paused";

export default function SiteSettingsToggle({
  settingKey,
  label,
  description,
  initialValue,
}: {
  settingKey: SettingKey;
  label: string;
  description: string;
  initialValue: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setError(null);
    setBusy(true);
    setValue(next); // optimistic

    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .update({ [settingKey]: next, updated_at: new Date().toISOString() })
      .eq("id", 1);

    setBusy(false);

    if (error) {
      setValue(!next); // revert
      setError(error.message);
    }
  }

  return (
    <div className="flex items-start justify-between gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}
      </div>
      <label className="inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={value}
          disabled={busy}
          onChange={(e) => toggle(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-amber-500 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></div>
      </label>
    </div>
  );
}
