export const SERVER_METADATA = {
  description: "A Bun + TypeScript FastMCP starter template.",
  name: "ts-bun-mcp",
  version: "1.0.0",
} as const;

export const MCP_CLIENT_METADATA = {
  name: "ts-bun-mcp-client",
  version: "1.0.0",
} as const;

export type ServerMetadata = typeof SERVER_METADATA;
