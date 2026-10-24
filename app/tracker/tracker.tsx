"use client";

import { useMemo, useState } from "react";
import { daysBetween, lessonNumber, type Routine } from "./routines";
import { buildDays, isComplete, perfectStreaks, type Day } from "./stats";
import { doneKey as key, useTrackerData, writeDone } from "./store";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const weekdayFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "narrow",
  timeZone: "UTC",
});

const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

export function Tracker() {
  const { today, done } = useTrackerData();
  // Only days the user has toggled; everything else uses the default.
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>(
    {},
  );

  const days = useMemo(
    () => (today ? buildDays(today, done) : []),
    [today, done],
  );

  if (!today) return <Skeleton />;

  const todayDay = days[0];
  const streak = perfectStreaks(days).current;

  const totalItems = days.reduce((n, d) => n + d.routines.length, 0);
  const totalDone = days.reduce((n, d) => n + d.done, 0);
  const overall = totalItems ? Math.round((totalDone / totalItems) * 100) : 0;

  const week = days.slice(0, 7).reverse();

  function toggle(date: string, routine: Routine) {
    const next = new Set(done);
    const k = key(date, routine);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    writeDone(next);
  }

  function setDay(day: Day, value: boolean) {
    const next = new Set(done);
    for (const r of day.routines) {
      if (value) next.add(key(day.date, r));
      else next.delete(key(day.date, r));
    }
    writeDone(next);
  }

  const isOpen = (date: string) => openOverrides[date] ?? date === today;

  function jumpTo(date: string) {
    setOpenOverrides((o) => ({ ...o, [date]: true }));
    document
      .getElementById(`d-${date}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function label(date: string) {
    const ago = daysBetween(date, today!);
    if (ago === 0) return "Today";
    if (ago === 1) return "Yesterday";
    return dateFormat.format(asDate(date));
  }

  return (
    <>
      <section
        aria-label="Summary"
        className="mt-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex items-center gap-4">
          <ProgressRing value={todayDay.done} max={todayDay.routines.length} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-indigo-600">Today</p>
            <p className="text-lg font-semibold text-zinc-900">
              {todayDay.done} of {todayDay.routines.length} done
            </p>
            <p className="text-sm text-zinc-600">
              {isComplete(todayDay)
                ? "All done for today."
                : `${todayDay.routines.length - todayDay.done} left`}
            </p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-md bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-600">Streak</dt>
            <dd className="text-xl font-semibold text-zinc-900">
              {streak} {streak === 1 ? "day" : "days"}
            </dd>
          </div>
          <div className="rounded-md bg-zinc-50 p-3">
            <dt className="text-xs text-zinc-600">All time</dt>
            <dd className="text-xl font-semibold text-zinc-900">{overall}%</dd>
          </div>
        </dl>
        <ol aria-label="Last 7 days" className="mt-4 grid grid-cols-7 gap-1.5">
          {week.map((d) => (
            <li key={d.date}>
              <button
                type="button"
                onClick={() => jumpTo(d.date)}
                aria-label={`${label(d.date)}: ${d.done} of ${d.routines.length} done`}
                className={`flex min-h-11 w-full flex-col items-center justify-center rounded-md text-xs leading-tight transition-colors ${
                  isComplete(d)
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : d.done > 0
                      ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                } ${d.date === today ? "ring-2 ring-indigo-600 ring-offset-1" : ""}`}
              >
                <span aria-hidden="true">
                  {weekdayFormat.format(asDate(d.date))}
                </span>
                <span aria-hidden="true" className="font-semibold">
                  {asDate(d.date).getUTCDate()}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <ol className="mt-6 space-y-3">
        {days.map((d) => {
          const open = isOpen(d.date);
          const panelId = `p-${d.date}`;
          return (
            <li
              key={d.date}
              id={`d-${d.date}`}
              className="scroll-mt-4 rounded-lg border border-zinc-200 bg-white shadow-sm"
            >
              <h2>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() =>
                    setOpenOverrides((o) => ({ ...o, [d.date]: !open }))
                  }
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-zinc-50 sm:px-5"
                >
                  <span className="flex-1">
                    <span className="block font-semibold text-zinc-900">
                      {label(d.date)}
                    </span>
                    {daysBetween(d.date, today) < 2 && (
                      <span className="block text-sm text-zinc-600">
                        {dateFormat.format(asDate(d.date))}
                      </span>
                    )}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-sm font-medium tabular-nums ${
                      isComplete(d)
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {d.done}/{d.routines.length}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}
                  >
                    ›
                  </span>
                </button>
              </h2>
              {open && (
                <div id={panelId} className="px-2 pb-3 sm:px-3">
                  <ul>
                    {d.routines.map((r) => {
                      const checked = done.has(key(d.date, r));
                      return (
                        <li key={r.id}>
                          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-zinc-50">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(d.date, r)}
                              className="size-5 shrink-0 cursor-pointer accent-indigo-600"
                            />
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block ${
                                  checked
                                    ? "text-zinc-500 line-through"
                                    : "text-zinc-900"
                                }`}
                              >
                                {r.label}
                              </span>
                              <span className="block text-sm text-zinc-600">
                                {r.name}
                                {r.id === "lesson" &&
                                  ` · Day ${lessonNumber(d.date)}`}{" "}
                                · {r.time}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-1 flex justify-end px-2">
                    <button
                      type="button"
                      onClick={() => setDay(d, !isComplete(d))}
                      className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {isComplete(d) ? "Clear day" : "Mark all done"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear every tick? This can't be undone.")) {
              writeDone(new Set());
            }
          }}
          className="inline-flex min-h-11 items-center px-2 text-sm text-zinc-600 hover:text-red-700"
        >
          Reset all
        </button>
      </div>
    </>
  );
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const fraction = max ? value / max : 0;
  return (
    <svg
      viewBox="0 0 64 64"
      className="size-16 shrink-0 -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        strokeWidth="8"
        className="stroke-zinc-100"
      />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        className="stroke-indigo-600 transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="mt-8 space-y-3" aria-busy="true">
      <p className="sr-only">Loading tracker…</p>
      <div className="h-52 animate-pulse rounded-lg bg-zinc-100" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100" />
      ))}
    </div>
  );
}
