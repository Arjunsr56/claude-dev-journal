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
  {
    day: 10,
    date: "2026-10-26",
    title: "Messages API fundamentals (TypeScript SDK)",
    note: "Day 10: Today I finally got hands-on with the Claude Messages API, and it clicked faster than I expected. I experimented with system prompts to shape Claude's tone and behavior, then tuned max_tokens to control response length and learned to check stop_reason to tell whether a reply finished naturally or got cut off. Next up: wiring these pieces into a small project so I can see them work together!",
  },
  {
    day: 11,
    date: "2026-10-26",
    title: "Prompt engineering",
    note: "I learned that Claude does best with clear, direct instructions, written as if for a smart new colleague who has no context on my project. Explaining why a rule exists helps more than stating it, because Claude can then apply the reason to cases I didn't think of. A few examples show the format and tone I want better than a description of them, and XML tags like `<instructions>`, `<example>` and `<code>` keep the parts of a prompt from blurring together and make the output easy to pull out with a script. I tested this in `prompts/` by asking for a review of the same buggy component twice. \"Review this code.\" got a 646-word review that found all nine bugs, while a structured prompt with a role, reasons, one example and `<review>` tags got a focused 197-word list of the three bugs that matter most to users. I also learned that prefilling the start of Claude's reply in an assistant message now returns a 400 error on newer models, so to control the format I use instructions, examples and XML tags instead.",
  },
  {
    day: 12,
    date: "2026-10-29",
    title: "Streaming Claude responses",
    note: "I streamed Claude's replies into the site through a route handler at `app/api/ask/route.ts`. It calls `client.messages.stream()` and wraps the events in a `ReadableStream`, so text reaches the browser as it's generated instead of all at once when the reply is finished. A new `/ask` page reads the response with `getReader()` and a `TextDecoder` and appends each chunk to the answer as it arrives. I also learned the order of the server-sent events in a stream: `message_start`, then for each content block a `content_block_start`, a run of `content_block_delta` events and a `content_block_stop`, then `message_delta`, which carries the `stop_reason` and final usage, and finally `message_stop`. My route only forwards the `text_delta` deltas as plain text and skips everything else, and if the browser disconnects, its `cancel()` calls `stream.abort()` so the request to Claude stops too.",
  },
  {
    day: 13,
    date: "2026-10-29",
    title: "Tool use",
    note: 'I built a tool-using agent loop over my journal in `scripts/ask-journal.mts`, which gives Claude two tools, `list_entries` and `get_entry`, each defined by a name, a description and a JSON Schema `input_schema`. Claude doesn\'t run the tools itself: when it wants one, the response comes back with `stop_reason: "tool_use"` and a `tool_use` block holding the tool name and input. My code runs the matching function, sends the output back in a `tool_result` block with the same `tool_use_id`, and calls the API again with the whole conversation, looping until `stop_reason` is something other than `tool_use`. If a tool throws, I return the error with `is_error: true` so Claude can recover instead of the script crashing. I also learned that tool descriptions steer behavior, since telling Claude to call `list_entries` first makes it find the relevant days before fetching their full text.',
  },
  {
    day: 14,
    date: "2026-10-31",
    title: "Structured Outputs with Zod",
    note: "Today I learned how to use structured outputs with Zod, and the parse helper is genuinely neat because it turns model responses straight into typed data. I got caught out by the schema limits, though, since some constraints I expected to work simply aren't supported. Next time I'll check the supported schema features before designing the whole thing around them.",
  },
  {
    day: 15,
    date: "2026-10-31",
    title: "Vision & PDFs",
    note: "I learned how to send files to Claude, using an `image` block for images and a `document` block for PDFs, each carrying the file as base64. The file block goes before the text block, so the prompt comes after the content it refers to. I also learned that images cost tokens by size, at roughly one token per ~28px patch. To try it out, I built a `/describe` page and an `app/api/describe/route.ts` route that accept an image or PDF of up to 5 MB and show a bulleted description with the input and output token counts.",
  },
];
