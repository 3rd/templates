# react-spa

React SPA template with Vite, TypeScript, Wouter, Tailwind CSS, Vitest, and React Testing Library.

## Commands

```sh
bun install
bun run dev
bun run verify
```

## Structure

- `src/App.tsx` wires the dashboard shell and Wouter routes.
- `src/components` contains small reusable UI pieces.
- `src/routes` contains route components.
- `src/test` contains the Vitest browser-like setup.

## Notes

- Auth and backend data are intentionally out of scope for this SPA template.
- Add API clients under `src/api` when connecting this template to a backend.
