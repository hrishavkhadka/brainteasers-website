import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SignInPromptProvider } from "@/components/auth/SignInPromptProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://brainbench67.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BrainBench",
    template: "%s · BrainBench",
  },
  description:
    "Practice IQ-style questions across verbal, numerical, spatial, and logical reasoning. Free, community-driven, with hints and explanations.",
  openGraph: {
    type: "website",
    siteName: "BrainBench",
    title: "BrainBench",
    description:
      "Practice IQ-style questions across verbal, numerical, spatial, and logical reasoning.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "BrainBench",
    description:
      "Practice IQ-style questions across verbal, numerical, spatial, and logical reasoning.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
    isAdmin = profile?.is_admin === true;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark')}}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <SiteSettingsProvider>
          <SignInPromptProvider>
            <Suspense
              fallback={
                <div className="h-16 border-b border-gray-200 dark:border-gray-800" />
              }
            >
              <Header
                user={user ? { id: user.id, email: user.email ?? "" } : null}
                username={username}
                isAdmin={isAdmin}
              />
            </Suspense>
            <div className="flex-1">{children}</div>
            <Footer />
          </SignInPromptProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
