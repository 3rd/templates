export const SERVER_METADATA = {
  name: "ts-mcp",
  version: "0.0.0",
  description: "A TypeScript MCP server template.",
  runtime: "node",
} as const;

export type ServerMetadata = typeof SERVER_METADATA;
