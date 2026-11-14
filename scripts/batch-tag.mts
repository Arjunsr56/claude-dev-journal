import Anthropic from "@anthropic-ai/sdk";
import { entries } from "../app/journal/entries";

const client = new Anthropic();
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const batch = await client.messages.batches.create({
  requests: entries.map((e: unknown, i: number) => ({
    custom_id: `entry-${i}`,
    params: {
      model: "claude-haiku-5-5",
      max_tokens: 400,
      system: "Reply with exactly 3 lowercase comma-separated tags. Nothing else.",
      messages: [{ role: "user", content: JSON.stringify(e) }],
    },
  })),
});
console.log("Submitted", batch.id);

let b = batch;
while (b.processing_status !== "ended") {
  await sleep(30_000);
  b = await client.messages.batches.retrieve(batch.id);
  console.log(b.processing_status, b.request_counts);
}

for await (const r of await client.messages.batches.results(batch.id)) {
  const m = r.result.type === "succeeded" ? r.result.message : null;
  const text = m
    ? m.content.map(c => (c.type === "text" ? c.text : "")).join("").trim()
    : `(${r.result.type})`;
  const tags = text.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
  console.log(
    r.custom_id, "→",
    tags.length ? tags.join(", ") : `(EMPTY: stop_reason=${m?.stop_reason})`
  );
}