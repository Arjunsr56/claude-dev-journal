import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
const q = `Meetings A (45 min), B (30 min), C (30 min) must fit
between 10:00 and 12:00, no overlaps, starting only on
15-minute marks. A must end before C starts. B cannot
start before 10:30. How many valid schedules exist?`;

for (const effort of ["low", "medium", "high"] as const) {
  const t0 = Date.now();
  const res = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 4000,
    thinking: { type: "adaptive", display: "summarized" },
    output_config: { effort },
    messages: [{ role: "user", content: q }],
  });
  const think = res.content.flatMap(b => b.type === "thinking" ? [b.thinking] : []).join("\n");
  const text = res.content.flatMap(b => b.type === "text" ? [b.text] : []).join("\n");
  console.log(`\n=== ${effort} | ${Date.now() - t0} ms | stop: ${res.stop_reason}`);
  console.log("thinking tokens:", res.usage.output_tokens_details?.thinking_tokens ?? 0,
              "| total output:", res.usage.output_tokens);
  console.log("summary:", think.slice(0, 250) || "(no thinking)");
  console.log("answer:", text.slice(-300));
}