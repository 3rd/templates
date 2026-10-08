import { McpServer } from "#mcp/server";
import { SERVER_METADATA } from "../constants";
import { registerSummarizePrompt } from "../prompts/summarize";
import { registerServerInfoResource } from "../resources/server-info";
import { registerAddTool } from "../tools/add";

export const createServer = (): McpServer => {
  const server = new McpServer({
    name: SERVER_METADATA.name,
    version: SERVER_METADATA.version,
  });

  registerAddTool(server);
  registerServerInfoResource(server, SERVER_METADATA);
  registerSummarizePrompt(server);

  return server;
};
