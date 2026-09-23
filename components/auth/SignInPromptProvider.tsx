"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AuthForm from "./AuthForm";

type SignInPromptContextValue = {
  open: (message?: string) => void;
  close: () => void;
};

const SignInPromptContext = createContext<SignInPromptContextValue | null>(
  null,
);

export function useSignInPrompt() {
  const ctx = useContext(SignInPromptContext);
  if (!ctx) {
    throw new Error("useSignInPrompt must be used inside SignInPromptProvider");
  }
  return ctx;
}

export function SignInPromptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const open = useCallback((msg?: string) => {
    setMessage(msg ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setMessage(null);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // Lock scroll behind modal
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <SignInPromptContext.Provider value={{ open, close }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 py-8"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Sign in"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-lg leading-none"
            >
              ×
            </button>

            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 pr-8">
                {message}
              </p>
            )}

            <AuthForm compact onSuccess={close} />
          </div>
        </div>
      )}
    </SignInPromptContext.Provider>
  );
}
