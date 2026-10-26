import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const ENTRIES = path.resolve(here, "../../app/journal/entries.ts");

function createServer() {
  const server = new McpServer({ name: "journal", version: "1.0.0" });

  server.registerTool("read_journal",
    { description: "Return the raw contents of the dev journal entries file",
      inputSchema: z.object({}) },
    async () => ({ content: [{ type: "text",
      text: await readFile(ENTRIES, "utf8") }] }));

  server.registerTool("course_day",
    { description: "Today's date in IST and the course day number",
      inputSchema: z.object({ start: z.string().default("2026-10-15")
        .describe("Day 0 as YYYY-MM-DD") }) },
    async ({ start }) => {
      const today = new Date().toLocaleDateString("en-CA",
        { timeZone: "Asia/Kolkata" });
      const day = Math.round((Date.parse(today) - Date.parse(start)) / 864e5);
      return { content: [{ type: "text", text: `${today} → Day ${day}` }] };
    });

  return server;
}

serveStdio(createServer, { onerror: (e) => console.error(e) });
console.error("journal MCP server running"); // stderr only!