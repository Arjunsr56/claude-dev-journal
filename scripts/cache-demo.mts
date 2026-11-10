import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";

const client = new Anthropic();
const files = [
  "app/journal/entries.ts",
  "app/api/ask/route.ts",
  "app/ask/page.tsx",
];
const context = files
  .map((f) => `<file path="${f}">\n${readFileSync(f, "utf8")}\n</file>`)
  .join("\n");

async function ask(q: string) {
  const t = Date.now();
  const res = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 150,
    system: [
      {
        type: "text",
        text: "You are a code reviewer for this Next.js project. Be brief.",
      },
      { type: "text", text: context, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: q }],
  });
  console.log(q, `${Date.now() - t}ms`, res.usage);
}

await ask("How many journal entries are there?");
await ask("Suggest one improvement to the /ask route.");
