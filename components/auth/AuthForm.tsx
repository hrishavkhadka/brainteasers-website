"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function AuthForm({
  onSuccess,
  compact = false,
}: {
  onSuccess?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // NEW: track whether signups are globally paused
  const [signupsPaused, setSignupsPaused] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("site_settings")
      .select("signups_paused")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        setSignupsPaused(data?.signups_paused === true);
      });
  }, []);

  function tryEnterSignup() {
    if (signupsPaused) {
      setError("Signups are paused at the moment. Please try again later.");
      return;
    }
    setMode("signup");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      if (signupsPaused) {
        setError("Signups are paused at the moment. Please try again later.");
        setLoading(false);
        return;
      }

      if (!USERNAME_RE.test(username)) {
        setError(
          "Username must be 3–20 characters: letters, numbers, or underscore.",
        );
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if (existing) {
        setError("That username is already taken.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) {
        const msg = error.message ?? "";
        if (
          msg.includes("SIGNUPS_PAUSED") ||
          msg.includes("Database error saving new user") ||
          msg.toLowerCase().includes("signups are paused")
        ) {
          setError("Signups are paused at the moment. Please try again later.");
        } else {
          setError(msg);
        }
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.refresh();
    if (onSuccess) onSuccess();
    else router.push("/");
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div>
      {!compact && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {mode === "signin"
              ? "Welcome back."
              : "Sign up to submit questions, vote, and comment."}
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {mode === "signup" && (
          <div>
            <label htmlFor="username" className={labelCls}>
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="letters, numbers, underscore"
              className={inputCls}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 rounded-lg transition-colors"
        >
          {loading
            ? "Please wait..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {mode === "signin" ? (
          <>
            No account? {/* NEW: disable / grayed-out state when paused */}
            <button
              type="button"
              onClick={tryEnterSignup}
              disabled={signupsPaused === true}
              className={
                signupsPaused === true
                  ? "text-gray-400 dark:text-gray-500 cursor-not-allowed font-medium"
                  : "text-blue-600 dark:text-blue-400 hover:underline font-medium"
              }
              title={signupsPaused ? "Signups are paused" : undefined}
            >
              Sign up
            </button>
            {signupsPaused === true && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Signups are paused at the moment.
              </p>
            )}
          </>
        ) : (
          <>
            Already have one?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
