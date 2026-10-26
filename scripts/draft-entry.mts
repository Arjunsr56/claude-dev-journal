import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const msg = await client.messages.create({
  model: "claude-haiku-5-5",
  max_tokens: 15,
  system: "You write short, upbeat developer journal entries.",
  messages: [
    {
      role: "user",
      content:
        "Draft a 3-sentence journal entry for Day 10: I learned the Claude Messages API — system prompts, max_tokens and stop_reason.",
    },
  ],
});

const text = msg.content.find((b) => b.type === "text")?.text;
console.log(text);
console.log(msg.stop_reason, msg.usage); // e.g. end_turn { input_tokens: 31, output_tokens: 88 }
