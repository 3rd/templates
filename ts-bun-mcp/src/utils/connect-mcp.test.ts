import { describe, expect, it } from "bun:test";
import type { Client } from "@modelcontextprotocol/sdk/client";
import type { Context, FastMCPSessionAuth } from "fastmcp";
import { createConnectedMcp, listMcpTools } from "@/utils/connect-mcp";

type CallToolParams = Parameters<Client["callTool"]>[0];
type FastMcpContext = Context<FastMCPSessionAuth>;
type RemoteTool = Awaited<ReturnType<Client["listTools"]>>["tools"][number];
type RemoteToolCallResult = Awaited<ReturnType<Client["callTool"]>>;

const remoteTools: RemoteTool[] = [
  {
    name: "search",
    title: "Docs Search",
    description: "Search remote docs.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        total: {
          type: "number",
        },
      },
      required: ["total"],
    },
    annotations: {
      readOnlyHint: true,
    },
    _meta: {
      source: "remote-docs",
    },
    execution: {
      taskSupport: "optional",
    },
    icons: [
      {
        src: "https://example.com/icon.png",
      },
    ],
  },
  {
    name: "fetch",
    inputSchema: {
      type: "object",
    },
  },
];
const searchTool = remoteTools[0];
const fetchTool = remoteTools[1];

if (!searchTool || !fetchTool) throw new Error("Missing test tools.");

const createContext = (): FastMcpContext => {
  return {
    client: {
      version: undefined,
    },
    log: {
      debug: () => {},
      error: () => {},
      info: () => {},
      warn: () => {},
    },
    reportProgress: async () => {},
    session: undefined,
    streamContent: async () => {},
  };
};

describe("listMcpTools", () => {
  it("loads all tool pages eagerly", async () => {
    const cursors: (string | undefined)[] = [];
    const listTools: Client["listTools"] = async (params) => {
      cursors.push(params?.cursor);

      if (params?.cursor === "page-2") {
        return {
          tools: [fetchTool],
        };
      }

      return {
        tools: [searchTool],
        nextCursor: "page-2",
      };
    };

    const tools = await listMcpTools({ listTools });

    expect(cursors).toEqual([undefined, "page-2"]);
    expect(tools).toEqual(remoteTools);
  });
});

describe("createConnectedMcp", () => {
  it("exposes tools, getTool, raw calls, and close", async () => {
    const calls: CallToolParams[] = [];
    let closed = false;
    const rawResult: RemoteToolCallResult = {
      content: [{ type: "text", text: "ok" }],
      isError: false,
      structuredContent: {
        total: 1,
      },
    };
    const callTool: Client["callTool"] = async (params) => {
      calls.push(params);
      return rawResult;
    };

    const mcp = createConnectedMcp(
      {
        callTool,
        close: async () => {
          closed = true;
        },
      },
      remoteTools,
    );

    expect(mcp.tools.map(({ name }) => name)).toEqual(["search", "fetch"]);
    expect(mcp.getTool("search")?.meta).toBe(searchTool);
    expect(mcp.getTool("search")?.outputSchema).toEqual(searchTool.outputSchema);

    let missingToolError: unknown;

    try {
      await mcp.call("missing");
    } catch (error) {
      missingToolError = error;
    }

    expect(missingToolError).toBeInstanceOf(Error);
    if (missingToolError instanceof Error) {
      expect(missingToolError.message).toContain("Unknown MCP tool 'missing'");
    }

    const result = await mcp.call("search", {
      query: "bun",
    });

    expect(result).toBe(rawResult);
    expect(calls).toEqual([
      {
        arguments: {
          query: "bun",
        },
        name: "search",
      },
    ]);

    await mcp.close();

    expect(closed).toBe(true);
  });

  it("exports a FastMCP tool with preserved metadata and default forwarding", async () => {
    const callTool: Client["callTool"] = async () => {
      return {
        content: [
          {
            type: "text",
            text: "remote result",
          },
          {
            description: "Read more",
            name: "docs",
            title: "Docs",
            type: "resource_link",
            uri: "file:///docs.md",
          },
        ],
        isError: true,
      };
    };

    const mcp = createConnectedMcp(
      {
        callTool,
        close: async () => {},
      },
      remoteTools,
    );
    const tool = mcp.getTool("search");

    expect(tool).toBeDefined();
    if (!tool) throw new Error("Missing search tool.");

    const exportedTool = tool.toFastMcp();

    expect(exportedTool.name).toBe("search");
    expect(exportedTool.description).toBe("Search remote docs.");
    expect(exportedTool._meta).toEqual({
      source: "remote-docs",
    });
    expect(exportedTool.annotations).toEqual({
      readOnlyHint: true,
      title: "Docs Search",
    });
    expect(exportedTool.outputSchema).toBeUndefined();

    const validArguments = exportedTool.parameters!["~standard"].validate({
      query: "bun",
    });
    const invalidArguments = exportedTool.parameters!["~standard"].validate({
      extra: true,
      query: "bun",
    });
    const invalidTypeArguments = exportedTool.parameters!["~standard"].validate({
      query: 123,
    });

    expect("value" in validArguments).toBe(true);
    expect("issues" in invalidArguments).toBe(true);
    expect("issues" in invalidTypeArguments).toBe(true);

    const result = await exportedTool.execute(
      {
        query: "bun",
      },
      createContext(),
    );

    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: "remote result",
        },
        {
          description: "Read more",
          name: "docs",
          title: "Docs",
          type: "resource_link",
          uri: "file:///docs.md",
        },
      ],
      isError: true,
    });
  });

  it("normalizes legacy toolResult values through the exported execute function", async () => {
    const callTool: Client["callTool"] = async () => {
      return {
        toolResult: {
          total: 3,
        },
      };
    };

    const mcp = createConnectedMcp(
      {
        callTool,
        close: async () => {},
      },
      remoteTools,
    );
    const tool = mcp.getTool("search");

    expect(tool).toBeDefined();
    if (!tool) throw new Error("Missing search tool.");

    const exportedTool = tool.toFastMcp();

    const result = await exportedTool.execute(
      {
        query: "sdk",
      },
      createContext(),
    );

    expect(result).toEqual({
      content: [
        {
          text: `{
  "total": 3
}`,
          type: "text",
        },
      ],
    });
  });
});
