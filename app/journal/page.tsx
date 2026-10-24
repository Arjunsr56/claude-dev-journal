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

// Notes mark file paths and commands with backticks; render those as <code>.
function renderNote(note: string) {
  return note.split("`").map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.875em] text-zinc-800"
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}

export default function JournalPage() {
  const sorted = [...entries].sort((a, b) => b.day - a.day);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/"
        className="-ml-2 inline-flex min-h-11 items-center px-2 text-sm text-zinc-600 hover:text-zinc-900"
      >
        <span aria-hidden="true">←</span>&nbsp;Home
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
        Journal
      </h1>
      <p className="mt-2 text-zinc-600">
        {entries.length} {entries.length === 1 ? "entry" : "entries"}
      </p>

      <ol className="mt-8 space-y-4">
        {sorted.map((entry) => (
          <li
            key={entry.day}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <article
              aria-labelledby={`day-${entry.day}`}
              className="flex flex-col"
            >
              {/* The heading comes first in the DOM so heading navigation
                  reaches the title before its day and date; order-first
                  keeps the label row above it visually. */}
              <h2
                id={`day-${entry.day}`}
                className="mt-2 text-lg font-semibold text-zinc-900"
              >
                {entry.title}
              </h2>
              <div className="order-first flex items-baseline justify-between gap-4 text-sm">
                <span className="font-medium text-indigo-600">
                  Day {entry.day}
                </span>
                <time dateTime={entry.date} className="text-zinc-600">
                  {dateFormat.format(new Date(entry.date))}
                </time>
              </div>
              <p className="mt-1 text-zinc-600 wrap-break-word">
                {renderNote(entry.note)}
              </p>
            </article>
          </li>
        ))}
      </ol>
    </main>
  );
}
