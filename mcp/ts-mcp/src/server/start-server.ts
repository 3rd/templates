import { StdioServerTransport } from "#mcp/server/stdio";
import { createServer } from "./create-server";

export const startServer = async (): Promise<void> => {
  const server = createServer();
  await server.connect(new StdioServerTransport());
};
