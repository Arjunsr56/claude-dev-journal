// scripts/cost.mts
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
const PRICE = { in: 0.10, out: 0.50 }; // Haiku 5.5, $/MTok, prompts ≤100K

const params = {
  model: "claude-haiku-5-5",
  max_tokens: 300,
  system: "You are a concise senior React mentor.",
  messages: [{ role: "user" as const, content: "Explain React Server Components in 3 bullets." }],
};

// 1) Before: free estimate
const { input_tokens } = await client.messages.countTokens({
  model: params.model, system: params.system, messages: params.messages,
});
const worst = (input_tokens * PRICE.in + params.max_tokens * PRICE.out) / 1e6;
console.log(`Estimate: ${input_tokens} input tokens, worst case $${worst.toFixed(6)}`);

// 2) Real call, keeping the HTTP response so we can read headers
const { data: msg, response } = await client.messages.create(params).withResponse();
const u = msg.usage;
const cost = (u.input_tokens * PRICE.in + u.output_tokens * PRICE.out) / 1e6;
console.log(`Actual: in ${u.input_tokens}, out ${u.output_tokens}, cost $${cost.toFixed(6)}`);
console.log("Requests left:", response.headers.get("anthropic-ratelimit-requests-remaining"));
console.log("Input tokens left:", response.headers.get("anthropic-ratelimit-input-tokens-remaining"));