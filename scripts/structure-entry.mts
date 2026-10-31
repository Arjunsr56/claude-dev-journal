import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const Entry = z.object({
  day: z.number().int(),
  title: z.string().describe('Without "Day N"'),
  note: z.string().describe("3-5 sentences in first person"),
});

const client = new Anthropic(); // reads ANTHROPIC_API_KEY
const note = process.argv.slice(2).join(" ");

const msg = await client.messages.parse({
  model: "claude-haiku-5-5",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: `Turn this learning note into a journal entry:\n\n${note}`,
    },
  ],
  output_config: { format: zodOutputFormat(Entry) },
});

if (msg.stop_reason !== "end_turn" || !msg.parsed_output) {
  throw new Error(`No valid output (stop_reason: ${msg.stop_reason})`);
}
const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
}); // gives YYYY-MM-DD
const entry = { ...msg.parsed_output, date: today };
console.log(JSON.stringify(entry, null, 2));
