import Anthropic from "@anthropic-ai/sdk";
import { entries } from "../app/journal/entries";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const tools: Anthropic.Tool[] = [
  {
    name: "list_entries",
    description:
      "List all journal entries (day, date, title). Call first to find relevant days.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_entry",
    description: "Get the full text of one journal entry by day number.",
    input_schema: {
      type: "object",
      properties: { day: { type: "integer", description: "e.g. 4" } },
      required: ["day"],
    },
  },
];

function runTool(name: string, rawInput: unknown): string {
  const input = rawInput as { day?: number };
  if (name === "list_entries")
    return JSON.stringify(
      entries.map((e) => ({ day: e.day, date: e.date, title: e.title })),
    );
  if (name === "get_entry") {
    const e = entries.find((x) => x.day === input.day);
    if (!e) throw new Error(`No entry for day ${input.day}`);
    return JSON.stringify(e);
  }
  throw new Error(`Unknown tool ${name}`);
}

const messages: Anthropic.MessageParam[] = [
  { role: "user", content: process.argv[2] ?? "What did I learn about hooks?" },
];

while (true) {
  const res = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    tools,
    messages,
  });
  messages.push({ role: "assistant", content: res.content });

  if (res.stop_reason !== "tool_use") {
    console.log(
      res.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n"),
    );
    break;
  }
  const results: Anthropic.ToolResultBlockParam[] = res.content
    .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
    .map((b) => {
      console.log(`→ ${b.name}(${JSON.stringify(b.input)})`);
      try {
        return {
          type: "tool_result",
          tool_use_id: b.id,
          content: runTool(b.name, b.input),
        };
      } catch (err) {
        return {
          type: "tool_result",
          tool_use_id: b.id,
          content: String(err),
          is_error: true,
        };
      }
    });
  messages.push({ role: "user", content: results });
}
