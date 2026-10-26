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
    note: "I added a `CLAUDE.md` to this project so Claude Code starts every session already knowing how the repo works. It lists the commands (`dev`, `build`, `lint`), explains that there is no test suite so `npm run build` is the check, and describes where journal entries live and the rules they follow. I learned that `CLAUDE.md` can pull in other files with `@` imports, so it includes `AGENTS.md`, which `next dev` writes to warn that this Next.js version differs from what Claude was trained on. I also learned there are layers of memory: a project `CLAUDE.md` that gets committed and shared, plus personal rules in `~/.claude` that apply to all my projects, and the `/memory` command opens them for editing.",
  },
  {
    day: 3,
    date: "2026-10-18",
    title: "Skills and custom slash commands",
    note: "I built my first Claude Code skill, a `/journal-entry` slash command that lives in `.claude/skills/journal-entry/SKILL.md`. I learned that the frontmatter controls how a skill behaves: `disable-model-invocation` means only I can trigger it, `argument-hint` documents what to pass, and `allowed-tools` limits it to reading, editing and running the build. The body can run shell commands like `date` and `git log` before Claude sees the prompt, so each entry starts from today's date and my recent commits. I also found out the hard way that `$ARGUMENTS` is empty if I invoke the command without a title, so I always pass one now.",
  },
  {
    day: 4,
    date: "2026-10-22",
    title: "Hooks: deterministic guardrails",
    note: "I added hooks in `.claude/settings.json` so some rules run every time instead of depending on the model. A `PreToolUse` hook runs `protect-files.sh` and blocks edits to files like `.env`, a `PostToolUse` hook runs Prettier on every file Claude edits or writes, and a `Notification` hook pops up a macOS alert when Claude needs me. A hook that succeeds runs silently, and one that blocks sends its message back to Claude.",
  },
  {
    day: 5,
    date: "2026-10-22",
    title: "Subagents: a read-only code reviewer",
    note: "I built my first subagent, a `code-reviewer` defined in `.claude/agents/code-reviewer.md`. Its frontmatter sets a `name`, a `description` that tells Claude when to use it, and a `tools` allowlist of just `Read`, `Glob` and `Grep`, so it can inspect the code but can't edit files or run commands. Because it couldn't run git, I had to hand it the list of changed files when I invoked it. It ran in its own context and reported back a short list of findings, including that my Day 3 title repeated the day number and that my `protect-files` hook let edits through if `jq` failed.",
  },
  {
    day: 6,
    date: "2026-10-23",
    title: "MCP servers, scopes and my first plugin",
    note: "I learned that MCP servers can be added at three scopes: local (just me, in this project), project (saved in `.mcp.json` and committed so everyone gets it), and user (available in all my projects). I connected the Playwright MCP server at project scope, which gave Claude a real browser to drive. I used it to audit this journal page at 375px, and it found a tiny tap target on the home link, a missing favicon and file paths that blended into the text, which I then fixed. I also installed my first plugin, `commit-commands` from `claude-plugins-official`, which bundles `/commit`, `/commit-push-pr` and `/clean_gone` into one install.",
  },
  {
    day: 7,
    date: "2026-10-24",
    title: "Headless mode and GitHub Actions",
    note: 'I learned that Claude Code can run without an interactive session: `claude -p "prompt"` runs headless, prints the result and exits, so I can use it in scripts and pipe the output to other tools. I also set it up in GitHub Actions with the Claude Code action, so mentioning `@claude` in an issue or PR starts a run on a CI runner that reads the repo and its `CLAUDE.md`. It works on its own branch, pushes commits and reports progress back in a single comment. The workflow authenticates with my Claude Pro subscription token, not an API key. Since nobody is there to approve prompts, I learned to keep the allowed tools tight.',
  },
  {
    day: 8,
    date: "2026-10-26",
    title: "MCP concepts",
    note: "I learned the three roles in MCP: the host is the app I'm using, like Claude Code, it runs one client per server, and each server is a program that provides capabilities over that client's connection. Servers offer tools, which are actions the model decides to call, resources, which are data the app reads by URI, and prompts, which are templates I pick myself as slash commands. I tried this with the `everything` demo server by calling its `echo` tool and reading resources, and found that a URI like `demo://resource/dynamic/blob/` is only a pattern that needs an index such as `/1` before it returns anything. Servers connect in one of two ways: with stdio the host starts the server as a local process and they talk over stdin and stdout, and with HTTP the server runs separately, often remotely, and receives requests over the network. The older HTTP+SSE transport is now deprecated.",
  },
  {
    day: 9,
    date: "2026-10-26",
    title: "Building my first MCP server",
    note: "I built my own MCP server called `journal` in `mcp-server/`, written in TypeScript with the `@modelcontextprotocol/server` SDK and `zod` for input schemas. It registers two tools with `registerTool`: `read_journal` returns the raw contents of `app/journal/entries.ts`, and `course_day` returns today's date in IST and how many days have passed since a start date, which defaults to `2026-10-15` but can be passed in. It talks over stdio through `serveStdio`, so Claude Code starts it as a local process, and its startup message goes to `console.error` because anything written to stdout would corrupt the protocol messages. I compile it with `tsc` into `build/` and connected it to Claude Code, then used its own tools to look up the course day and read the journal before writing this entry. The tool said Day 11 because it counts calendar days, while my journal counts the days I actually studied.",
  },
];
