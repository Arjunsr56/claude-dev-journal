---
description: Add a dated learning entry to the dev journal
disable-model-invocation: true
argument-hint: [title of today's lesson]
allowed-tools: Read Edit Bash(date *) Bash(git log *) Bash(npm run build *)
---

Today's date: !`date +%Y-%m-%d`
Recent commits: !`git log --oneline -5`

Add a new entry to app/journal/entries.ts titled "$ARGUMENTS".

1. Read the file first and copy the exact shape of the existing entries.
2. Set `day` to the highest existing `day` + 1. Don't put "Day N" in the title.
3. Write 3–5 sentences in first person on what I learned, using the commits above.
4. Append it to the end of the array (entries are kept oldest first).
5. Add a matching row to the **Progress** table in README.md.
6. Run `npm run build` and fix any type errors.
