# ts-bun-mcp

Bun + TypeScript + FastMCP starter for a local `stdio` MCP server.

This template gives you:

- a minimal FastMCP server
- one sample tool, one sample resource, and one sample prompt
- Bun-native scripts for dev, inspect, test, and validation
- a small helper for connecting to another MCP and working with its tools

## Quick start

```bash
bun install
bun run dev
```

Use the Inspector when you want to exercise the server by hand:

```bash
bun run inspect
```

Run these before you call the template healthy:

```bash
bun run test
bun run check
bun run validate
```

## Project shape

- `src/index.ts`: entrypoint, starts the server only when run directly
- `src/server/create-server.ts`: composition root
- `src/tools/`: MCP tools
- `src/resources/register-resources.ts`: sample `template://server-info` resource
- `src/prompts/register-prompts.ts`: sample `git-commit` prompt
- `src/utils/trim-lines.ts`: multiline string helper
- `src/utils/connect-mcp.ts`: remote MCP tool helper

## Common tasks

### Add a real tool

Create a folder under `src/tools/`, keep the implementation and test together, then register it from `src/tools/register-tools.ts`.

```ts
import type { FastMCP } from "fastmcp";
import { registerAddTool } from "@/tools/add/add";

export const registerTools = (server: FastMCP) => {
  registerAddTool(server);
};
```

The sample `add` tool is the reference shape.

### Replace the sample MCP surface

The starter ships all three MCP surface types so the template is useful immediately:

- tool: `add`
- resource: `template://server-info`
- prompt: `git-commit`

Most real projects replace the sample tool first, then update or remove the sample resource and prompt.

## Connect to another MCP

`src/utils/connect-mcp.ts` is the tools-only helper for another `stdio` MCP.

Most projects should start with `connectMcp(...)` and ignore the lower-level exports unless they are writing custom wiring or tests.

The main surface is:

- `connectMcp(source)`: connect and eagerly load remote tools
- `mcp.tools`: loaded remote tool list
- `mcp.getTool(name)`: look up one tool by remote name
- `mcp.call(name, args)`: call a remote tool and get the raw SDK result
- `tool.toFastMcp()`: convert one loaded remote tool into a FastMCP tool definition
- `mcp.close()`: close the remote client

### Basic example

```ts
import { connectMcp } from "@/utils/connect-mcp";

const remote = await connectMcp({
  transport: "stdio",
  command: "bun",
  args: ["run", "../other-mcp/src/index.ts"],
});

const searchTool = remote.getTool("search");
if (searchTool) {
  const fastMcpTool = searchTool.toFastMcp();

  server.addTool({
    name: searchTool.name,
    description: searchTool.description,
    _meta: searchTool._meta,
    annotations: fastMcpTool.annotations,
    parameters: fastMcpTool.parameters,
    execute: fastMcpTool.execute,
  });
}

const result = await remote.call("search", {
  query: "bun inspector",
});
```

### Filter tools yourself

There is no batch export abstraction. Filter and choose tools with plain JavaScript:

```ts
const readOnlyTools = remote.tools.filter((tool) => tool.annotations?.readOnlyHint);
```

### What gets preserved on export

If you add `tool.toFastMcp()` directly to the server, it carries across the upstream tool metadata:

- `description`
- `annotations`
- `_meta`
- `inputSchema`

The remote tool's original `outputSchema` is still available on `tool.outputSchema`, but the adapter does not forward it into the exported FastMCP tool.

If you want manual control, build the final `server.addTool(...)` object yourself and reuse the adapter only for the parts you do not want to reimplement, such as `annotations`, `parameters`, and `execute`.

### Lower-level helpers

If you need more control than `connectMcp(...)`, the module also exports:

- `connectMcpClient(...)`
- `listMcpTools(...)`
- `createConnectedMcp(...)`

Those are mainly useful for tests or custom wiring. Most template users should not need them.

## Development workflow

Use this order when you change behavior:

1. update the nearest tool, resource, prompt, or utility
2. run the nearest focused test first
3. run `bun run check`
4. run `bun run validate`
5. use `bun run inspect` if the change affects the MCP surface

`bun run validate` runs strict TypeScript checks and imports `src/index.ts` without starting the server.

## Inspector notes

The Inspector script is:

```bash
bun run inspect
```

The official Inspector currently requires Node.js `>=22.7.5`, even if the server itself runs under Bun.

## First things to change in a real project

- update `SERVER_METADATA` in `src/constants.ts`
- replace the sample `add` tool with your own tool folders
- update or remove the sample resource and prompt
- keep `src/server/create-server.ts` as the composition root
- keep `src/utils/connect-mcp.ts` only if you actually need remote MCP tools
