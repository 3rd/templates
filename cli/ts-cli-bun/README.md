# ts-cli-bun

Template for a TypeScript CLI package that targets Bun and can build a standalone Bun binary.

## Runtime Contract

The source and bundled CLI target Bun 1.1+. `build` emits a Bun-run JavaScript CLI at `dist/index.js`; `build:binary` emits a standalone executable at `dist/app` with Bun's `--compile` mode.

The starter uses `gunsmith` with help, version, JSON, color, and completions support enabled. MCP, schema, and llms flags are disabled by default to keep the initial CLI surface small.

`@modelcontextprotocol/sdk` is intentionally not installed. Gunsmith lazy-loads MCP support, and this starter disables MCP flags.

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
bun run build:binary
bun run smoke:binary
bun run verify
```

After building the Bun JavaScript CLI:

```bash
./dist/index.js greet Ada
./dist/index.js greet Ada --excited
./dist/index.js greet Ada -e
./dist/index.js greet Ada --json
```

After building the binary:

```bash
./dist/app greet Ada
./dist/app greet Ada --excited
./dist/app greet Ada -e
./dist/app greet Ada --json
```

Optional binary targets:

```bash
bun run build:binary:bytecode
bun run build:binary:linux
bun run build:binary:linux:x64
bun run build:binary:linux:arm64
bun run build:binary:macos
bun run build:binary:macos:x64
bun run build:binary:macos:arm64
bun run build:binary:windows
bun run build:binary:windows:x64
bun run build:binary:all
```

## Rename Checklist

Before publishing or using a copied project:

1. Rename `name`, `description`, and package metadata in `package.json`.
2. Update the `bin` command name in `package.json`.
3. Update `CLI_NAME`, `CLI_VERSION`, and the description in `src/cli.ts`.
4. Choose the project license.
5. Set `private` to `false` when ready to publish.
6. Run `bun run verify`.
