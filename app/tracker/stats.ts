import {
  addDays,
  daysBetween,
  routines,
  routinesFor,
  trackerStart,
  type Routine,
} from "./routines";
import { doneKey } from "./store";

export type Day = { date: string; routines: Routine[]; done: number };

export const isComplete = (d: Day) => d.done === d.routines.length;

// Every day from `today` back to `from` (default: the tracker start), newest first.
export function buildDays(
  today: string,
  done: Set<string>,
  from = trackerStart,
): Day[] {
  const start = from < trackerStart ? trackerStart : from;
  const count = daysBetween(start, today) + 1;
  return Array.from({ length: Math.max(count, 0) }, (_, i) => {
    const date = addDays(today, -i);
    const rs = routinesFor(date);
    return {
      date,
      routines: rs,
      done: rs.filter((r) => done.has(doneKey(date, r))).length,
    };
  });
}

// Length of the current run and the longest run in `hits`, newest first.
// If the first item is today, leaving it unfinished doesn't break the run.
function streaks(hits: boolean[], firstIsToday: boolean) {
  let current = 0;
  const skip = firstIsToday && hits[0] === false ? 1 : 0;
  for (let i = skip; i < hits.length && hits[i]; i++) {
    current++;
  }
  let best = 0;
  let run = 0;
  for (const hit of hits) {
    run = hit ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return { current, best };
}

// Days where every scheduled routine was done.
export function perfectStreaks(days: Day[]) {
  return streaks(days.map(isComplete), true);
}

export type RoutineStats = {
  routine: Routine;
  scheduled: number;
  completed: number;
  rate: number; // 0–1
  current: number;
  best: number;
};

// Totals cover `days` (the selected range); streaks always cover all time.
export function routineStats(
  days: Day[],
  allDays: Day[],
  done: Set<string>,
): RoutineStats[] {
  return routines.map((routine) => {
    const inRange = days.filter((d) => d.routines.includes(routine));
    const completed = inRange.filter((d) =>
      done.has(doneKey(d.date, routine)),
    ).length;
    const scheduledDays = allDays.filter((d) => d.routines.includes(routine));
    const hits = scheduledDays.map((d) => done.has(doneKey(d.date, routine)));
    return {
      routine,
      scheduled: inRange.length,
      completed,
      rate: inRange.length ? completed / inRange.length : 0,
      ...streaks(hits, scheduledDays[0]?.date === allDays[0]?.date),
    };
  });
}
