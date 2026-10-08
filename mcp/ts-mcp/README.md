# ts-mcp

Template for a TypeScript MCP server package that ships a Node-compatible stdio server and uses Bun for local development.

## Runtime Contract

The built MCP server targets Node 22+. Development, tests, and package scripts use Bun 1.1+.

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
bun run verify
```

After building:

```bash
node dist/index.js
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
