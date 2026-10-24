import type { Metadata } from "next";
import Link from "next/link";
import { Tracker } from "./tracker";

export const metadata: Metadata = {
  title: "Tracker",
  description: "Daily checklist for my scheduled Claude routines",
};

export default function TrackerPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="-ml-2 inline-flex min-h-11 items-center px-2 text-sm text-zinc-600 hover:text-zinc-900"
      >
        <span aria-hidden="true">←</span>&nbsp;Home
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
        Routine tracker
      </h1>
      <p className="mt-2 text-zinc-600">
        Tick off what I did with each scheduled routine. Saved in this browser.
      </p>
      <Link
        href="/tracker/dashboard"
        className="mt-2 inline-flex min-h-11 items-center font-medium text-indigo-600 hover:text-indigo-800"
      >
        View progress dashboard →
      </Link>
      <Tracker />
    </main>
  );
}
