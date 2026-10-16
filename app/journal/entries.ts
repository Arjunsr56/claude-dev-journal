export type Entry = {
  day: number;
  date: string; // ISO date, e.g. "2026-10-16"
  title: string;
  note: string;
};

export const entries: Entry[] = [
  {
    day: 1,
    date: "2026-10-16",
    title: "Claude models + Claude Code setup",
    note: "Learned the Claude model lineup (Fable, Opus, Sonnet, Haiku) and when to pick each. Set up Claude Code on my Pro plan and used it to build this journal app.",
  },
];
