import type { Metadata } from "next";
import Link from "next/link";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Progress across my scheduled Claude routines",
};

export default function DashboardPage() {
  return (
    <div className="min-h-dvh bg-zinc-50">
      <main className="mx-auto max-w-5xl px-4 py-12">
        <Link
          href="/tracker"
          className="-ml-2 inline-flex min-h-11 items-center px-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <span aria-hidden="true">←</span>&nbsp;Tracker
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          Progress dashboard
        </h1>
        <p className="mt-2 text-zinc-600">
          How consistently I act on each scheduled routine.
        </p>
        <Dashboard />
      </main>
    </div>
  );
}
