import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

const MAX_BYTES = 5 * 1024 * 1024;
const PROMPT =
  "Describe this file in 3–5 bullets. If it’s a UI screenshot, list the components you see.";

function isImageType(type: string): type is ImageType {
  return (IMAGE_TYPES as readonly string[]).includes(type);
}

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return fail("Expected a multipart form upload.", 400);
  }

  if (!(file instanceof File) || file.size === 0) {
    return fail("Choose a file to upload.", 400);
  }
  if (file.size > MAX_BYTES) {
    return fail("File must be 5 MB or smaller.", 413);
  }

  const mediaType = file.type;
  if (!isImageType(mediaType) && mediaType !== "application/pdf") {
    return fail("File must be a PNG, JPEG, WebP, GIF or PDF.", 415);
  }

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const fileBlock: Anthropic.ContentBlockParam = isImageType(mediaType)
    ? { type: "image", source: { type: "base64", media_type: mediaType, data } }
    : {
        type: "document",
        source: { type: "base64", media_type: mediaType, data },
      };

  try {
    const response = await client.messages.create({
      model: "claude-haiku-5-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [fileBlock, { type: "text", text: PROMPT }],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return fail("Claude declined to describe this file.", 422);
    }

    const text = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("");
    if (!text) {
      return fail("Claude returned no description. Try again.", 502);
    }

    return Response.json({ text, usage: response.usage });
  } catch (error) {
    if (error instanceof Anthropic.BadRequestError) {
      return fail(
        "Claude couldn't read this file. It may be corrupt or not match its type.",
        400,
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail("Rate limited. Try again shortly.", 429);
    }
    console.error("/api/describe failed:", error);
    return fail("Couldn't reach Claude. Try again.", 502);
  }
}
