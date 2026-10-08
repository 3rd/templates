import type { McpServer } from "#mcp/server";
import type { ServerMetadata } from "../constants";

export const SERVER_INFO_URI = "template://server-info";

export const registerServerInfoResource = (server: McpServer, metadata: ServerMetadata): void => {
  server.registerResource(
    "server-info",
    SERVER_INFO_URI,
    {
      title: "Server Info",
      description: "Metadata for this MCP server template.",
      mimeType: "application/json",
    },
    (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    })
  );
};
