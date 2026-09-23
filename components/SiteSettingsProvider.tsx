"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type PauseFlags = {
  submissions_paused: boolean;
  signups_paused: boolean;
  reports_paused: boolean;
  comments_paused: boolean;
};

type SiteSettingsContextValue = {
  flags: PauseFlags;
  loading: boolean;
  refresh: () => Promise<void>;
};

const DEFAULT_FLAGS: PauseFlags = {
  submissions_paused: false,
  signups_paused: false,
  reports_paused: false,
  comments_paused: false,
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  flags: DEFAULT_FLAGS,
  loading: true,
  refresh: async () => {},
});

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export function SiteSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [flags, setFlags] = useState<PauseFlags>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("site_settings")
      .select(
        "submissions_paused, signups_paused, reports_paused, comments_paused",
      )
      .eq("id", 1)
      .single();

    if (data) {
      setFlags({
        submissions_paused: data.submissions_paused ?? false,
        signups_paused: data.signups_paused ?? false,
        reports_paused: data.reports_paused ?? false,
        comments_paused: data.comments_paused ?? false,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SiteSettingsContext.Provider value={{ flags, loading, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
