"use client";
import { useState } from "react";

export default function AskPage() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setAnswer(""); setLoading(true);
    const res = await fetch("/api/ask", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setAnswer(a => a + decoder.decode(value, { stream: true }));
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <textarea className="w-full border p-2" value={prompt}
        onChange={e => setPrompt(e.target.value)} />
      <button className="border px-4 py-2" onClick={ask} disabled={loading}>
        {loading ? "Thinking…" : "Ask Claude"}
      </button>
      <pre className="whitespace-pre-wrap">{answer}</pre>
    </main>
  );
}
