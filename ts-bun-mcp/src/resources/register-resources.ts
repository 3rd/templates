import type { FastMCP } from "fastmcp";
import type { ServerMetadata } from "@/constants";
import { trimLines } from "@/utils/trim-lines";

const createServerInfo = (metadata: ServerMetadata) => {
  return trimLines(`
    ${metadata.name} v${metadata.version}

    ${metadata.description}

    Starter modules:
    - src/tools/add/add.ts
    - src/tools/register-tools.ts
    - src/resources/register-resources.ts
    - src/prompts/register-prompts.ts
    - src/utils/connect-mcp.ts

    Replace the sample tool, resource, and prompt with your own MCP surface.
  `);
};

export const registerResources = (server: FastMCP, metadata: ServerMetadata) => {
  server.addResource({
    name: "Server Info",
    uri: "template://server-info",
    mimeType: "text/plain",
    load: async () => ({
      text: createServerInfo(metadata),
    }),
  });
};
