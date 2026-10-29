# Vague vs structured prompts

Two prompts asked Claude to review the same component, [`sample.tsx`](sample.tsx), a client component that fetches a team's users in a `useEffect` and renders them as a list.

- [`vague.txt`](vague.txt) is just "Review this code." Its output is [`vague-output.md`](vague-output.md).
- [`structured.txt`](structured.txt) gives Claude a role and an audience (a junior developer's PR), puts the rules in `<instructions>` tags with a reason for each, includes one `<example>` of a finished review, and asks for the answer inside `<review>` tags so a script can extract it. Its output is [`structured-output.md`](structured-output.md).

## Length and format

|                 | Vague                                                                                                   | Structured                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Prompt          | 3 words                                                                                                 | 142 words, 15 lines                                                       |
| Output          | 646 words, 93 lines                                                                                     | 197 words, 7 lines                                                        |
| Format          | Markdown headings (Critical, Bugs, Quality), a rewritten component and a section on alternative designs | One numbered list of 3 items inside `<review>` tags, nothing outside them |
| Issues reported | 9                                                                                                       | 3 (with 3 more folded into the fixes)                                     |
| Includes code   | A full rewritten component                                                                              | Inline snippets only                                                      |

The structured output matches the example's shape: a bold heading, why it matters to users, then `Fix:`. It bends two rules. The fixes run to a sentence or two instead of one line, and issue 3 adds `key={user.id}` and a `User` type "while you're there", which gets around the 3-issue limit.

## Which bugs each found

| Bug in `sample.tsx`                                                          | Vague | Structured                 |
| ---------------------------------------------------------------------------- | ----- | -------------------------- |
| `useEffect` has no dependency array, so it refetches forever                 | Yes   | Yes (#1)                   |
| No `res.ok` check or `.catch`: stuck on "Loading...", or `users.map` crashes | Yes   | Yes (#2)                   |
| Race condition: an old team's response can overwrite the new one             | Yes   | Yes, as part of the #1 fix |
| `loading` isn't reset when `teamId` changes                                  | Yes   | No                         |
| `teamId` goes into the URL without `encodeURIComponent`                      | Yes   | No                         |
| `any` turns off type checking                                                | Yes   | Yes, as part of the #3 fix |
| `key={index}` instead of a stable ID                                         | Yes   | Yes, as part of the #3 fix |
| Clickable `<li>` can't be reached by keyboard or screen readers              | Yes   | Yes (#3)                   |
| No empty state for a team with no users                                      | Yes   | No                         |

The vague prompt found all 9, plus `alert()` left in as debug code. The structured prompt found 6, and all three of its numbered issues affect users, ranked in the order the prompt asked for. It missed the loading reset, URL encoding and the empty state.

## Takeaways

- A vague prompt isn't a worse prompt, it's an unscoped one. Claude filled the gap with everything it could think of, which is thorough but too long for a PR comment and has no fixed shape a script could parse.
- The structured prompt traded coverage for focus. Each limit came with a reason ("the developer has limited time", "a script will read it"), and the output followed the intent of those reasons, not just the wording.
- The one example did more for the format than the instructions did. The output copied its bold-heading-then-`Fix:` pattern exactly.
- To get both, keep the structure but raise the limit, or ask for the top 3 in `<review>` and the rest in a separate `<other_issues>` tag.
