import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const BATCH_ID = "msgbatch_01Kz2M73VmxrFsrgfdRyCFLb";

for await (const r of await client.messages.batches.results(BATCH_ID)) {
  if (r.result.type !== "succeeded") continue;
  const m = r.result.message;
  console.log(
    r.custom_id,
    "| stop:", m.stop_reason,
    "| blocks:", m.content.map(c => c.type),
    "| in:", m.usage.input_tokens,
    "| out:", m.usage.output_tokens
  );
}