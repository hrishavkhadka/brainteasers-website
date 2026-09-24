import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://brainbench67.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("questions")
    .select("id, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1000);

  const questionUrls: MetadataRoute.Sitemap = (data ?? []).map((q) => ({
    url: `${SITE_URL}/question/${q.id}`,
    lastModified: new Date(q.created_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/donate`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...questionUrls,
  ];
}
