<review>
1. **The component keeps fetching forever:** `useEffect` has no dependency array, so it runs after every render. Each `setUsers` causes another render, which starts another fetch, so the API gets hit over and over and the page keeps re-rendering. Fix: add `[teamId]` as the dependency array, and in the cleanup set an `ignore = true` flag that's checked before calling `setUsers`, so a slow response from an old `teamId` can't overwrite the new team's users.

2. **Errors leave the user on "Loading..." forever:** there's no `res.ok` check and no `.catch`, so a 404, a 500 or a network failure means `setLoading(false)` never runs. If the API returns an error object, `users.map` will crash the component. Fix: throw when `!res.ok`, add a `.catch` that sets an `error` state you render, and call `setLoading(false)` in a `.finally`.

3. **Keyboard and screen-reader users can't use the list items:** an `onClick` on an `<li>` can't be focused or triggered from the keyboard, so those users can't reach this action. Fix: put a `<button type="button" onClick={...}>` inside each `<li>`, and while you're there, use `key={user.id}` and replace `any` with a `User` type (`{ id: string; name: string; email: string }`).
</review>
