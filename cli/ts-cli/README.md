# ts-cli

Template for a TypeScript CLI package that ships a Node-compatible npm `bin` and uses Bun for local development.

## Runtime Contract

The built CLI targets Node 22+ and also runs during development with Bun 1.1+. Source typechecking uses Node ambient types; test typechecking adds Bun ambient types for `bun:test`.

The starter uses `gunsmith` with help, version, JSON, color, and completions support enabled. MCP, schema, and llms flags are disabled by default to keep the initial CLI surface small.

## Setup

```bash
bun install
```

## Commands

```bash
bun src/index.ts greet Ada
bun src/index.ts greet Ada --excited
bun src/index.ts greet Ada -e
bun src/index.ts greet Ada --json

bun test
bun run typecheck
bun run build
bun run smoke
bun run verify
```

After building:

```bash
node dist/index.js greet Ada
node dist/index.js greet Ada --excited
node dist/index.js greet Ada -e
node dist/index.js greet Ada --json
```

## Rename Checklist

Before publishing or using a copied project:

1. Rename `name`, `description`, and package metadata in `package.json`.
2. Update the `bin` command name in `package.json`.
3. Update `CLI_NAME`, `CLI_VERSION`, and the description in `src/cli.ts`.
4. Choose the project license.
5. Set `private` to `false` when ready to publish.
6. Run `bun run verify`.
