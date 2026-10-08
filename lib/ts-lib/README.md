# ts-lib

Template for a TypeScript library package that builds dual ESM/CJS Node-compatible output for Node and Bun with tsdown.

## Runtime Contract

Library source targets the Node-compatible runtime surface that runs on Node 22+ and Bun 1.1+. Source typechecking uses Node ambient types; test typechecking adds Bun ambient types for `bun:test`.

## Setup

```bash
bun install
```

## Commands

```bash
bun test
bun run typecheck
bun run build
bun run publint
bun run attw
bun run verify
```

## Publishing Checklist

Before publishing a copied project:

1. Rename `name`, `description`, and package metadata in `package.json`.
2. Choose the project license.
3. Set `private` to `false`.
4. Add `publishConfig.access` if the package is scoped and should publish publicly.
5. Run `bun run verify`.
