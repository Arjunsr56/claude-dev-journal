import type { Metadata } from "next";
import Link from "next/link";
import { entries } from "./entries";

export const metadata: Metadata = {
  title: "Journal",
  description: "Daily learning entries",
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export default function JournalPage() {
  const sorted = [...entries].sort((a, b) => b.day - a.day);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Home
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
        Journal
      </h1>
      <p className="mt-2 text-zinc-600">
        {entries.length} {entries.length === 1 ? "entry" : "entries"}
      </p>

      <ol className="mt-8 space-y-4">
        {sorted.map((entry) => (
          <li
            key={entry.day}
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-indigo-600">
                Day {entry.day}
              </span>
              <time dateTime={entry.date} className="text-zinc-500">
                {dateFormat.format(new Date(entry.date))}
              </time>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">
              {entry.title}
            </h2>
            <p className="mt-1 text-zinc-600">{entry.note}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
