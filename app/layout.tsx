import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { SignInPromptProvider } from "@/components/auth/SignInPromptProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "BrainBench",
  description:
    "Practice IQ questions across verbal, numerical, spatial, and logical reasoning.",
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
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <SiteSettingsProvider>
          <SignInPromptProvider>
            <Header
              user={user ? { id: user.id, email: user.email ?? "" } : null}
              username={username}
              isAdmin={isAdmin}
            />
            {children}
          </SignInPromptProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
