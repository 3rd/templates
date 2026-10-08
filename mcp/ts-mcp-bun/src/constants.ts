export const SERVER_METADATA = {
  name: "ts-mcp-bun",
  version: "0.0.0",
  description: "A Bun TypeScript MCP server template.",
  runtime: "bun",
} as const;

export type ServerMetadata = typeof SERVER_METADATA;
