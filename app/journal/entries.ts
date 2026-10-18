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
  {
    day: 2,
    date: "2026-10-17",
    title: "CLAUDE.md memory files",
    note: "I added a CLAUDE.md to this project so Claude Code starts every session already knowing how the repo works. It lists the commands (dev, build, lint), explains that there is no test suite so npm run build is the check, and describes where journal entries live and the rules they follow. I learned that CLAUDE.md can pull in other files with @ imports, so it includes AGENTS.md, which next dev writes to warn that this Next.js version differs from what Claude was trained on. I also learned there are layers of memory: a project CLAUDE.md that gets committed and shared, plus personal rules in ~/.claude that apply to all my projects, and the /memory command opens them for editing.",
  },
  {
    day: 3,
    date: "2026-10-18",
    title: "Day 3: Skills and custom slash commands",
    note: "I built my first Claude Code skill, a /journal-entry slash command that lives in .claude/skills/journal-entry/SKILL.md. I learned that the frontmatter controls how a skill behaves: disable-model-invocation means only I can trigger it, argument-hint documents what to pass, and allowed-tools limits it to reading, editing and running the build. The body can run shell commands like date and git log before Claude sees the prompt, so each entry starts from today's date and my recent commits. I also found out the hard way that $ARGUMENTS is empty if I invoke the command without a title, so I always pass one now.",
  },
];
