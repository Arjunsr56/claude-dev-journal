export type Routine = {
  id: string; // stable key used in localStorage, don't rename
  name: string;
  label: string; // checklist text
  time: string; // delivery time in IST, for display
  start: string; // ISO date of the first day it applies
  end?: string; // ISO date, inclusive
  weekdays?: number[]; // 0 = Sunday … 6 = Saturday; omitted means every day
};

// The first routine (the job list) was scheduled on this day.
export const trackerStart = "2026-10-15";

// Claude lesson Day 1 was 2026-10-16, so the lesson number is days since this.
const lessonEpoch = "2026-10-15";

// Kept in delivery order.
export const routines: Routine[] = [
  {
    id: "news",
    name: "AI and tech news digest",
    label: "Read the AI & tech digest",
    time: "7:50 AM",
    start: "2026-10-16",
  },
  {
    id: "lesson",
    name: "Claude developer lesson",
    label: "Did today's Claude lesson",
    time: "8:48 AM",
    start: "2026-10-16",
  },
  {
    id: "jobs",
    name: "Remote React job list",
    label: "Applied to jobs from the list",
    time: "8:51 AM",
    start: "2026-10-15",
  },
  {
    id: "linkedin",
    name: "LinkedIn post ideas",
    label: "Posted on LinkedIn",
    time: "8:51 AM",
    start: "2026-10-16",
    weekdays: [1],
  },
  {
    id: "freelance",
    name: "Freelance push",
    label: "Sent 5 freelance pitches",
    time: "8:54 AM",
    start: "2026-10-19",
    end: "2026-11-17",
  },
  {
    id: "stocks",
    name: "Stock market brief",
    label: "Read the stock market brief",
    time: "7:49 PM",
    start: "2026-10-16",
  },
];

const dayMs = 24 * 60 * 60 * 1000;

function toUTC(iso: string) {
  return Date.parse(`${iso}T00:00:00Z`);
}

export function addDays(iso: string, n: number) {
  return new Date(toUTC(iso) + n * dayMs).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((toUTC(to) - toUTC(from)) / dayMs);
}

export function routinesFor(iso: string) {
  const weekday = new Date(toUTC(iso)).getUTCDay();
  return routines.filter(
    (r) =>
      iso >= r.start &&
      (!r.end || iso <= r.end) &&
      (!r.weekdays || r.weekdays.includes(weekday)),
  );
}

export function lessonNumber(iso: string) {
  return daysBetween(lessonEpoch, iso);
}

// The routines run on IST, so "today" is the date in Asia/Kolkata.
// en-CA formats as YYYY-MM-DD.
const istDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
});

export function todayIST() {
  return istDate.format(new Date());
}
