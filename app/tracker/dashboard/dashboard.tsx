"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, daysBetween, routines, trackerStart } from "../routines";
import {
  buildDays,
  isComplete,
  perfectStreaks,
  routineStats,
  type Day,
  type RoutineStats,
} from "../stats";
import { doneKey, useTrackerData } from "../store";

const ranges = [
  { id: "7", label: "7 days", days: 7 },
  { id: "30", label: "30 days", days: 30 },
  { id: "all", label: "All time", days: null },
] as const;

type RangeId = (typeof ranges)[number]["id"];

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const longDate = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);
const pct = (n: number) => `${Math.round(n * 100)}%`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function Dashboard() {
  const { today, done } = useTrackerData();
  const [rangeId, setRangeId] = useState<RangeId>("30");

  const data = useMemo(() => {
    if (!today) return null;
    const range = ranges.find((r) => r.id === rangeId)!;
    const from = range.days ? addDays(today, -(range.days - 1)) : trackerStart;
    const allDays = buildDays(today, done);
    const days = buildDays(today, done, from);
    const items = days.reduce((n, d) => n + d.routines.length, 0);
    const checked = days.reduce((n, d) => n + d.done, 0);
    return {
      days,
      chrono: [...days].reverse(),
      items,
      checked,
      rate: items ? checked / items : 0,
      perfect: days.filter(isComplete).length,
      streak: perfectStreaks(allDays),
      perRoutine: routineStats(days, allDays, done),
      clipped: range.days !== null && from < trackerStart,
    };
  }, [today, done, rangeId]);

  if (!today || !data) return <Skeleton />;

  const todayDay = data.days[0];

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Date range"
          className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 shadow-sm"
        >
          {ranges.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={rangeId === r.id}
              onClick={() => setRangeId(r.id)}
              className={`min-h-9 rounded-md px-3 text-sm font-medium transition-colors ${
                rangeId === r.id
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-zinc-600">
          {shortDate.format(asDate(data.chrono[0].date))} –{" "}
          {shortDate.format(asDate(today))}
          {data.clipped && " · since tracking began"}
        </p>
      </div>

      {data.checked === 0 && (
        <p className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          No check-ins in this range yet.{" "}
          <Link href="/tracker" className="font-medium underline">
            Open the tracker
          </Link>{" "}
          to tick off what you&apos;ve done.
        </p>
      )}

      <section
        aria-label="Key numbers"
        className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatTile
          label="Completion rate"
          value={pct(data.rate)}
          detail={`${data.checked} of ${data.items} check-ins`}
          meter={data.rate}
        />
        <StatTile
          label="Current streak"
          value={plural(data.streak.current, "day")}
          detail={`Best: ${plural(data.streak.best, "day")}`}
        />
        <StatTile
          label="Perfect days"
          value={String(data.perfect)}
          detail={`of ${plural(data.days.length, "day")}`}
        />
        <StatTile
          label="Today"
          value={`${todayDay.done}/${todayDay.routines.length}`}
          detail={
            isComplete(todayDay)
              ? "All done"
              : `${todayDay.routines.length - todayDay.done} left`
          }
          meter={todayDay.done / todayDay.routines.length}
        />
      </section>

      <Card
        title="Daily completion"
        subtitle="Share of scheduled routines done each day"
      >
        <CompletionChart days={data.chrono} today={today} />
      </Card>

      <Card
        title="By routine"
        subtitle="Completion in the selected range · streaks count all time"
      >
        <RoutineTable stats={data.perRoutine} />
      </Card>

      <Card title="Activity" subtitle="Each square is one routine on one day">
        <Heatmap days={data.chrono} done={done} today={today} />
      </Card>
    </>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="font-semibold text-zinc-900">{title}</h2>
      <p className="mt-0.5 text-sm text-zinc-600">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatTile({
  label,
  value,
  detail,
  meter,
}: {
  label: string;
  value: string;
  detail: string;
  meter?: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-600">{detail}</p>
      {meter !== undefined && <Meter value={meter} className="mt-3" />}
    </div>
  );
}

function Meter({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`h-1.5 overflow-hidden rounded-full bg-indigo-100 ${className}`}
    >
      <div
        className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
        style={{ width: `${Math.min(value, 1) * 100}%` }}
      />
    </div>
  );
}

function CompletionChart({ days, today }: { days: Day[]; today: string }) {
  const [active, setActive] = useState<number | null>(null);
  const hovered = active === null ? null : days[active];
  // Shift the tooltip by the same share as its position so it stays inside.
  const position = active === null ? 0 : ((active + 0.5) / days.length) * 100;

  return (
    <div className="flex gap-2">
      <div
        aria-hidden="true"
        className="relative h-44 w-9 shrink-0 text-right text-xs text-zinc-500 tabular-nums"
      >
        {[100, 50, 0].map((t) => (
          <span
            key={t}
            className="absolute right-0 -translate-y-1/2"
            style={{ top: `${100 - t}%` }}
          >
            {t}%
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-44" onPointerLeave={() => setActive(null)}>
          {[0, 50, 100].map((t) => (
            <div
              key={t}
              aria-hidden="true"
              className="absolute inset-x-0 h-px bg-zinc-100"
              style={{ top: `${100 - t}%` }}
            />
          ))}
          <ol className="relative flex h-full items-end gap-0.5">
            {days.map((d, i) => {
              const rate = d.routines.length ? d.done / d.routines.length : 0;
              return (
                <li key={d.date} className="flex h-full flex-1 justify-center">
                  <button
                    type="button"
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${longDate.format(asDate(d.date))}: ${d.done} of ${d.routines.length} done, ${pct(rate)}`}
                    className="flex h-full w-full max-w-6 items-end focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <span
                      className={`block w-full rounded-t-[4px] transition-colors ${
                        rate === 0
                          ? "h-0.5 bg-zinc-200"
                          : active === i
                            ? "bg-indigo-500"
                            : "bg-indigo-600"
                      }`}
                      style={rate === 0 ? undefined : { height: pct(rate) }}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          {hovered && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 z-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm whitespace-nowrap shadow-lg"
              style={{
                left: `${position}%`,
                transform: `translate(-${position}%, -100%)`,
              }}
            >
              <span className="block font-semibold text-zinc-900">
                {pct(hovered.done / hovered.routines.length)}
              </span>
              <span className="block text-zinc-600">
                {hovered.done} of {hovered.routines.length} ·{" "}
                {longDate.format(asDate(hovered.date))}
              </span>
            </div>
          )}
        </div>
        <div
          aria-hidden="true"
          className="mt-2 flex justify-between text-xs text-zinc-500"
        >
          <span>{shortDate.format(asDate(days[0].date))}</span>
          <span>
            {days.at(-1)!.date === today
              ? "Today"
              : shortDate.format(asDate(days.at(-1)!.date))}
          </span>
        </div>
      </div>
    </div>
  );
}

function RoutineTable({ stats }: { stats: RoutineStats[] }) {
  return (
    <div className="relative -mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[20rem] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-600">
            <th scope="col" className="py-2 pr-3 pl-4 font-medium sm:pl-0">
              Routine
            </th>
            <th scope="col" className="w-2/5 px-3 py-2 font-medium">
              Completion
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Streak
            </th>
            <th
              scope="col"
              className="hidden py-2 pr-4 pl-3 text-right font-medium sm:table-cell sm:pr-0"
            >
              Best
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {stats.map((s) => (
            <tr key={s.routine.id}>
              <th
                scope="row"
                className="py-3 pr-3 pl-4 align-top font-normal sm:pl-0"
              >
                <span className="block font-medium text-zinc-900">
                  {s.routine.name}
                </span>
                <span className="block text-zinc-600">
                  {s.routine.weekdays ? "Mondays" : "Daily"} · {s.routine.time}
                </span>
              </th>
              <td className="px-3 py-3 align-top">
                {s.scheduled === 0 ? (
                  <span className="text-zinc-500">Not scheduled</span>
                ) : (
                  <>
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-zinc-900">
                        {pct(s.rate)}
                      </span>
                      <span className="text-zinc-600 tabular-nums">
                        {s.completed}/{s.scheduled}
                      </span>
                    </span>
                    <Meter value={s.rate} className="mt-1.5" />
                  </>
                )}
              </td>
              <td className="px-3 py-3 text-right align-top text-zinc-900 tabular-nums">
                {s.current}
              </td>
              <td className="hidden py-3 pr-4 pl-3 text-right align-top text-zinc-600 tabular-nums sm:table-cell sm:pr-0">
                {s.best}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Heatmap({
  days,
  done,
  today,
}: {
  days: Day[];
  done: Set<string>;
  today: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  // Start scrolled to the newest days when the grid is wider than the card.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [days.length]);
  // Label every day when there's room, otherwise one a week counting back from today.
  const showLabel = (date: string) =>
    days.length <= 14 || daysBetween(date, today) % 7 === 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-zinc-600">
        <ul className="flex items-center gap-4" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-indigo-600" /> Done
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] bg-zinc-200" /> Missed
          </li>
          <li className="flex items-center gap-1.5">
            <span className="flex size-3 items-center justify-center">
              <span className="size-1 rounded-full bg-zinc-300" />
            </span>
            Not scheduled
          </li>
        </ul>
        <p aria-hidden="true" className="min-h-4 text-zinc-900">
          {hover}
        </p>
      </div>
      <div
        ref={scroller}
        className="relative -mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        onPointerLeave={() => setHover(null)}
      >
        <table className="border-separate border-spacing-0.5 text-xs">
          <thead>
            <tr>
              <th scope="col" className="sr-only">
                Routine
              </th>
              {days.map((d) => (
                <th
                  key={d.date}
                  scope="col"
                  className="h-5 min-w-5 align-bottom sm:min-w-7 font-normal text-zinc-500 tabular-nums"
                >
                  <span className="sr-only">
                    {longDate.format(asDate(d.date))}
                  </span>
                  <span aria-hidden="true">
                    {showLabel(d.date) ? asDate(d.date).getUTCDate() : ""}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {routines.map((r) => (
              <tr key={r.id}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white pr-3 text-left font-normal whitespace-nowrap text-zinc-700 sm:pr-5 sm:text-sm"
                >
                  {r.name}
                </th>
                {days.map((d) => {
                  const scheduled = d.routines.includes(r);
                  const checked = scheduled && done.has(doneKey(d.date, r));
                  const status = !scheduled
                    ? "Not scheduled"
                    : checked
                      ? "Done"
                      : "Missed";
                  return (
                    <td
                      key={d.date}
                      onPointerEnter={() =>
                        setHover(
                          `${longDate.format(asDate(d.date))} · ${r.name}: ${status}`,
                        )
                      }
                      className="size-5 p-0 sm:size-7"
                    >
                      <span className="sr-only">{status}</span>
                      <span
                        aria-hidden="true"
                        className="flex size-5 items-center justify-center sm:size-7"
                      >
                        {scheduled ? (
                          <span
                            className={`size-4 rounded-[3px] sm:size-6 sm:rounded-[4px] ${
                              checked ? "bg-indigo-600" : "bg-zinc-200"
                            }`}
                          />
                        ) : (
                          <span className="size-1 rounded-full bg-zinc-300" />
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Skeleton() {
  return (
    <div className="mt-6 space-y-4" aria-busy="true">
      <p className="sr-only">Loading dashboard…</p>
      <div className="h-11 w-64 animate-pulse rounded-lg bg-zinc-200/70" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-zinc-200/70"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-zinc-200/70" />
    </div>
  );
}
