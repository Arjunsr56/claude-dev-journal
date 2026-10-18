---
description: Add a dated learning entry to the dev journal
disable-model-invocation: true
argument-hint: [title of today's lesson]
allowed-tools: Read Edit Bash(npm run build *)
---
Today's date: !`date +%Y-%m-%d`
Recent commits: !`git log --oneline -5`

Add a new entry to app/journal/entries.ts titled "$ARGUMENTS".
1. Read the file first and copy the exact shape of the existing entries.
2. Write 3–5 sentences in first person on what I learned, using the commits above.
3. Put it where the newest entry belongs (match the current order).
4. Run `npm run build` and fix any type errors.