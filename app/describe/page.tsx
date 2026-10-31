"use client";
import { useState } from "react";

type Result = {
  text: string;
  usage: { input_tokens: number; output_tokens: number };
};

// Pull the bullet text out of Claude's Markdown, dropping any lead-in line.
function toBullets(text: string) {
  return text
    .split("\n")
    .map((line) => line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/)?.[1])
    .filter((line): line is string => Boolean(line))
    .map((line) => line.replace(/\*\*/g, ""));
}

export default function DescribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) return;
    setResult(null);
    setError("");
    setLoading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/describe", { method: "POST", body });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error);
    } catch {
      setError("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const bullets = result ? toBullets(result.text) : [];

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <input
        type="file"
        className="block w-full border p-2"
        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        className="border px-4 py-2"
        onClick={upload}
        disabled={!file || loading}
      >
        {loading ? "Describing…" : "Upload"}
      </button>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      {result && (
        <>
          {bullets.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          ) : (
            <p className="whitespace-pre-wrap">{result.text}</p>
          )}
          <p className="text-sm text-gray-500">
            {result.usage.input_tokens} input tokens ·{" "}
            {result.usage.output_tokens} output tokens
          </p>
        </>
      )}
    </main>
  );
}
