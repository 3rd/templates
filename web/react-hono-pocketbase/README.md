# react-hono-pocketbase

React + Hono + PocketBase with Bun as the TypeScript runtime and a Go PocketBase app for auth and storage.

## Commands

```bash
bun install
bun run verify
```

Development uses three processes:

```bash
bun run dev
```

- Vite serves the React app.
- Hono serves `/api/*` and proxies PocketBase operations.
- PocketBase serves auth/storage from `pocketbase/`.

## Layout

- `src/client` is the React app.
- `src/server` is the Hono API facade.
- `src/shared` owns request and response shapes shared by the client and server.
- `pocketbase` is the Go PocketBase app and its schema migrations.

The browser only talks to Hono. PocketBase tokens are kept in an HttpOnly cookie and the PocketBase SDK stays inside `src/server/pocketbase`.

## Sessions

Login and registration set a session cookie with a seven-day maximum age. Ordinary authenticated requests validate the original PocketBase token without replacing it or extending the cookie. The session ends when that token or cookie expires; sign in again to start a new session. Logout clears the browser cookie but does not revoke a copied PocketBase token.

## Task pages

`GET /api/tasks` returns `{ tasks, hasNext }` with at most 20 tasks, newest first. Equal creation times are ordered by descending task ID. To fetch the next page, send both `beforeCreatedAt` and `beforeId` from the last task as query parameters. Omit both for the first page; incomplete or malformed cursors return 400.

Previous and Next preserve the unsent draft. Submitting a new task returns to the first page. Changing the signed-in user resets paging and the draft. Pages reflect current data rather than a frozen snapshot; if deletions leave a page empty, Previous remains available.
