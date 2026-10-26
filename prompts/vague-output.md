## Review

### Critical

**1. Infinite fetch loop.** The `useEffect` has no dependency array, so it runs after every render. When the fetch resolves, `setUsers` causes a re-render, the effect runs again, and it fetches again. This repeats forever and floods `/api/teams/:id/users`. The fix is to add `[teamId]` as the dependency array.

**2. No error handling.**
- `fetch` only rejects on network failure. A 404 or 500 still goes to `res.json()`, so `users` can end up as an error object like `{ error: "..." }`. Then `users.map` throws and the component crashes.
- If the request rejects, nothing catches it. `loading` stays `true` and the user sees "Loading..." forever.

### Bugs

**3. Race condition when `teamId` changes.** Switching teams quickly can let the slower, older response arrive last and overwrite the newer one. The list then shows the wrong team's users. The effect needs a cleanup function, such as an `AbortController`.

**4. Loading state isn't reset when `teamId` changes.** Even with the right dependencies, the old team's users stay on screen while the new team loads, with no loading indicator.

**5. `teamId` goes into the URL unencoded.** Wrap it in `encodeURIComponent`, so an ID containing `/`, `?` or `#` can't change which path is requested.

### Quality

**6. `any` everywhere.** `useState<any>` and `user: any` turn off type checking. Define a `User` type.

**7. `key={index}`.** Index keys cause wrong DOM and state reuse when the list is reordered or items are inserted or removed. Use a stable ID such as `user.id`.

**8. Clickable `<li>` isn't accessible.** It can't be focused with the keyboard and screen readers don't announce it as interactive. Use a `<button>` inside the `<li>`. `alert()` also looks like leftover debug code.

**9. No empty state.** An empty team renders an empty `<ul>` with no message.

### Fixed version

```tsx
"use client";

import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string };

type Result =
  | { teamId: string; users: User[] }
  | { teamId: string; error: string };

export default function UserList({ teamId }: { teamId: string }) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/teams/${encodeURIComponent(teamId)}/users`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<User[]>;
      })
      .then((users) => setResult({ teamId, users }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResult({
          teamId,
          error: err instanceof Error ? err.message : "Failed to load users",
        });
      });

    return () => controller.abort();
  }, [teamId]);

  // A result for a different team counts as still loading
  if (!result || result.teamId !== teamId) return <p>Loading...</p>;
  if ("error" in result) return <p role="alert">Couldn't load users: {result.error}</p>;
  if (result.users.length === 0) return <p>No users on this team.</p>;

  return (
    <ul>
      {result.users.map((user) => (
        <li key={user.id}>
          <button type="button" onClick={() => console.log(user)}>
            {user.name} – {user.email}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

How this fixes the bugs above:
- **Loading state:** Each result records the `teamId` it belongs to, so "loading" is worked out from that instead of stored separately. When `teamId` changes, the component shows "Loading..." right away. This also avoids calling `setState` synchronously inside the effect, which the newer `react-hooks` ESLint rules flag.
- **Race condition:** Aborting the request in the cleanup function stops stale responses from overwriting newer ones.
- **Unchecked data:** `res.json() as Promise<User[]>` is still an unchecked cast. If the API isn't fully trusted, validate the response (for example with zod).

### Consider a different design

This project is on the Next.js 16 App Router. Unless the list has to be a client component for interactivity, you could fetch the data in a Server Component and pass `users` down as a prop. That removes the effect, the loading state and the race condition completely. If you only need client-side data fetching, SWR or TanStack Query handles caching, deduplication, cancellation and error states for you.
