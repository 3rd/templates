# react-hono-trpc

React + Hono app template using tRPC, Wouter, TanStack Query, Tailwind CSS, and built-in SQLite.

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

The template includes local email/password auth with PBKDF2-SHA-256 and HttpOnly session cookies. Hono hosts tRPC at `/api/trpc`.

## Task pages

`tasks.list` returns `{ tasks, hasNext }` with at most 20 tasks, newest first. Equal creation times are ordered by descending task ID. To fetch the next page, pass both `beforeCreatedAt` and `beforeId` from the last task. Omit the input for the first page; incomplete or malformed cursors return `BAD_REQUEST`.

Previous and Next preserve the unsent draft. Submitting a new task returns to the first page. Changing the signed-in user resets paging and the draft. Pages reflect current data rather than a frozen snapshot; if deletions leave a page empty, Previous remains available.
