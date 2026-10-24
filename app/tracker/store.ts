import { useMemo, useSyncExternalStore } from "react";
import { todayIST, type Routine } from "./routines";

// Ticks are stored as a JSON array of "YYYY-MM-DD:routineId" keys.
const storageKey = "routine-tracker:v1";
const listeners = new Set<() => void>();
// Fallback for when localStorage is blocked, so ticks still work until reload.
let memory = "[]";

function readDone() {
  try {
    return localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return memory;
  }
}

export function writeDone(keys: Set<string>) {
  memory = JSON.stringify([...keys]);
  try {
    localStorage.setItem(storageKey, memory);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribeDone(onChange: () => void) {
  listeners.add(onChange);
  // Keeps other open tabs in sync.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Re-check the date when the tab comes back, so it rolls over at midnight.
function subscribeToday(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const getNull = () => null;

function parseDone(raw: string) {
  try {
    const parsed: unknown = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
}

export const doneKey = (date: string, routine: Routine) =>
  `${date}:${routine.id}`;

// Both values are null during prerender, so the static shell has no time or
// storage data. Render a skeleton until `today` is set.
export function useTrackerData() {
  const today = useSyncExternalStore(subscribeToday, todayIST, getNull);
  const raw = useSyncExternalStore(subscribeDone, readDone, getNull);
  const done = useMemo(() => parseDone(raw ?? "[]"), [raw]);
  return { today: raw === null ? null : today, done };
}
