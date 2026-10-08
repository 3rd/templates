# react-hono

React + Hono app template using Hono RPC, Wouter, TanStack Query, Tailwind CSS, and built-in SQLite.

## Commands

```sh
bun install
bun run dev
bun run verify
```

## Runtime

- Bun is the primary runtime for development.
- Node 24+ is supported through `node:sqlite` and `tsx`.
- SQLite uses built-in runtime modules only; no native npm SQLite package is required.

## Auth

The template includes local email/password auth with PBKDF2-SHA-256 and HttpOnly session cookies.

## Task pages

`GET /api/tasks` returns `{ tasks, hasNext }` with at most 20 tasks, newest first. Equal creation times are ordered by descending task ID. To fetch the next page, send both `beforeCreatedAt` and `beforeId` from the last task as query parameters. Omit both for the first page; incomplete or malformed cursors return 400.

Previous and Next preserve the unsent draft. Submitting a new task returns to the first page. Changing the signed-in user resets paging and the draft. Pages reflect current data rather than a frozen snapshot; if deletions leave a page empty, Previous remains available.
