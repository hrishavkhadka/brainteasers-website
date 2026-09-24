import type { MetadataRoute } from "next";

const SITE_URL = "https://brainbench67.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/my-submissions", "/submit", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
