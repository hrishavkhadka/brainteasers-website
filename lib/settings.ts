import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  submissions_paused: boolean;
  signups_paused: boolean;
  reports_paused: boolean;
  comments_paused: boolean;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select(
      "submissions_paused, signups_paused, reports_paused, comments_paused",
    )
    .eq("id", 1)
    .single();

  return {
    submissions_paused: data?.submissions_paused ?? false,
    signups_paused: data?.signups_paused ?? false,
    reports_paused: data?.reports_paused ?? false,
    comments_paused: data?.comments_paused ?? false,
  };
}

export async function canUserSubmit(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase
      .from("site_settings")
      .select("submissions_paused")
      .eq("id", 1)
      .single(),
    supabase
      .from("profiles")
      .select("can_submit, is_admin")
      .eq("id", userId)
      .single(),
  ]);

  if (profile?.is_admin) return true;
  if (settings?.submissions_paused) return false;
  if (profile?.can_submit === false) return false;
  return true;
}
