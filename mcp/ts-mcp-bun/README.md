# ts-mcp-bun

Template for a Bun-native TypeScript MCP server package that can build a standalone MCP server binary.

## Runtime Contract

The source and bundled MCP server target Bun 1.1+. `build` emits a Bun-run JavaScript server at `dist/index.js`; `build:binary` emits a standalone executable at `dist/app` with Bun's `--compile` mode.

The starter uses the official `@modelcontextprotocol/sdk` directly and exposes one sample tool, one sample resource, and one sample prompt:

- tool: `add`
- resource: `template://server-info`
- prompt: `summarize`

## Setup

```bash
bun install
```

## Commands

```bash
bun src/index.ts

bun test
bun run typecheck
bun run smoke:source
bun run build
bun run smoke
bun run build:binary
bun run smoke:binary
bun run verify
```

After building the Bun JavaScript server:

```bash
./dist/index.js
```

After building the binary:

```bash
./dist/app
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

## Project Shape

- `src/index.ts`: entrypoint, starts the stdio server only when run directly.
- `src/server/create-server.ts`: composition root for MCP tools, resources, and prompts.
- `src/tools/add.ts`: sample `add` tool and pure addition behavior.
- `src/resources/server-info.ts`: sample `template://server-info` resource.
- `src/prompts/summarize.ts`: sample `summarize` prompt.
- `scripts/smoke.mjs`: MCP client smoke check against a server command.

`src/prompts/summarize.ts` owns both `prompts/list` and `prompts/get` so omitted arguments reach the default topic. When adding a prompt, extend its listing and dispatch together. Do not mix these handlers with `server.registerPrompt()`, which replaces them.

## Rename Checklist

Before publishing or using a copied project:

1. Rename `name`, `description`, and package metadata in `package.json`.
2. Update the `bin` command name in `package.json`.
3. Update `SERVER_METADATA` in `src/constants.ts`.
4. Replace or remove the sample tool, resource, and prompt.
5. Choose the project license.
6. Set `private` to `false` when ready to publish.
7. Run `bun run verify`.
