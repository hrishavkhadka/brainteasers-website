import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · BrainBench",
  description: "How BrainBench handles your data.",
};

const CONTACT_EMAIL = "contact@brainbench67.vercel.app";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Privacy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Last updated: September 2026
        </p>

        <div className="prose-sm text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
          <p>
            BrainBench is a small, independent site for practicing IQ-style
            questions. This page explains what we collect and why.
          </p>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
              What we collect
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account data:</strong> your email address, chosen
                username, and a hashed password. We never see your plain
                password.
              </li>
              <li>
                <strong>Content you submit:</strong> questions, comments, votes,
                and reports. These are stored in our database.
              </li>
              <li>
                <strong>Uploaded images:</strong> stored in object storage and
                served to anyone who views the associated question.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
              What we don&apos;t do
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>No advertising trackers.</li>
              <li>No selling or sharing of your data with third parties.</li>
              <li>No analytics beyond basic server logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
              Where data lives
            </h2>
            <p>
              Data is stored with Supabase (Postgres database, authentication,
              and file storage) and served via Vercel. Both are widely used
              infrastructure providers with their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
              Deleting your data
            </h2>
            <p>
              Email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              and we&apos;ll remove your account and all associated content
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
              Cookies
            </h2>
            <p>
              We set a session cookie when you sign in, so you stay signed in
              between visits. No third-party cookies.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to questions
          </Link>
        </div>
      </div>
    </main>
  );
}
