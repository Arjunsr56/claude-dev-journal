import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

// Claude Haiku 5.5 prices, USD per million tokens
const INPUT_USD_PER_M = 0.1;
const OUTPUT_USD_PER_M = 0.5;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const stream = client.messages.stream({
    model: "claude-haiku-5-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
        return;
      }

      // Logging only: runs after the client's stream is closed, so it can't
      // change or delay the response.
      try {
        const { usage } = await stream.finalMessage();
        const cost =
          (usage.input_tokens * INPUT_USD_PER_M +
            usage.output_tokens * OUTPUT_USD_PER_M) /
          1_000_000;
        console.log(
          `[ask] input: ${usage.input_tokens} | output: ${usage.output_tokens} | cost: $${cost.toFixed(6)}`,
        );
      } catch (err) {
        console.error("[ask] usage logging failed:", err);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
