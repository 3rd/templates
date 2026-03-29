import { Client } from "@modelcontextprotocol/sdk/client";
import { AjvJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/ajv";
import type { ContentResult as FastMcpContentResult, FastMCPSessionAuth, Tool } from "fastmcp";
import { MCP_CLIENT_METADATA } from "@/constants";

type RemoteTool = Awaited<ReturnType<Client["listTools"]>>["tools"][number];
type JsonSchemaRecord = RemoteTool["inputSchema"];
type McpToolArguments = Record<string, unknown>;
type RemoteToolCallResult = Awaited<ReturnType<Client["callTool"]>>;
type RemoteToolContent = Extract<RemoteToolCallResult, { content: unknown }>["content"][number];

type McpToolSchema = {
  readonly "~standard": {
    readonly jsonSchema: {
      readonly input: () => JsonSchemaRecord;
      readonly output: () => JsonSchemaRecord;
    };
    readonly types?: {
      readonly input: McpToolArguments;
      readonly output: McpToolArguments;
    };
    readonly validate: (value: unknown) =>
      | {
          readonly issues: readonly {
            readonly message: string;
            readonly path?: readonly PropertyKey[];
          }[];
        }
      | {
          readonly value: McpToolArguments;
        };
    readonly vendor: "ts-bun-mcp";
    readonly version: 1;
  };
};

type McpCallClient = Pick<Client, "callTool" | "close">;
type ExportedFastMcpTool = Tool<FastMCPSessionAuth, McpToolSchema>;
const jsonSchemaValidator = new AjvJsonSchemaValidator();

export type McpClientMetadata = {
  name: string;
  version: `${number}.${number}.${number}`;
};

export type McpSource = {
  args?: string[];
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  stderr?: "ignore" | "inherit" | "pipe" | number;
  transport: "stdio";
};

export interface ConnectedMcpTool {
  _meta?: RemoteTool["_meta"];
  annotations?: RemoteTool["annotations"];
  description?: string;
  inputSchema: JsonSchemaRecord;
  meta: RemoteTool;
  name: string;
  outputSchema?: JsonSchemaRecord;
  title?: RemoteTool["title"];
  toFastMcp: () => ExportedFastMcpTool;
}

export interface ConnectedMcp {
  call: (name: string, args?: McpToolArguments) => Promise<RemoteToolCallResult>;
  close: () => Promise<void>;
  getTool: (name: string) => ConnectedMcpTool | undefined;
  tools: ConnectedMcpTool[];
}

const formatUnknownResult = (value: unknown) => {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const normalizeToolAnnotations = (tool: RemoteTool): ExportedFastMcpTool["annotations"] | undefined => {
  if (!tool.annotations && !tool.title) return undefined;

  return {
    destructiveHint: tool.annotations?.destructiveHint,
    idempotentHint: tool.annotations?.idempotentHint,
    openWorldHint: tool.annotations?.openWorldHint,
    readOnlyHint: tool.annotations?.readOnlyHint,
    title: tool.annotations?.title ?? tool.title,
  };
};

const normalizeToolContent = (content: RemoteToolContent): FastMcpContentResult["content"][number] => {
  switch (content.type) {
    case "audio": {
      return {
        type: "audio",
        data: content.data,
        mimeType: content.mimeType,
      };
    }
    case "image": {
      return {
        type: "image",
        data: content.data,
        mimeType: content.mimeType,
      };
    }
    case "resource": {
      return {
        resource:
          "blob" in content.resource ?
            {
              uri: content.resource.uri,
              blob: content.resource.blob,
              mimeType: content.resource.mimeType,
            }
          : {
              uri: content.resource.uri,
              text: content.resource.text,
              mimeType: content.resource.mimeType,
            },
        type: "resource",
      };
    }
    case "resource_link": {
      return {
        description: content.description,
        annotations: content.annotations,
        icons: content.icons,
        mimeType: content.mimeType,
        name: content.name,
        title: content.title,
        type: "resource_link",
        uri: content.uri,
        _meta: content._meta,
      };
    }
    case "text": {
      return { type: "text", text: content.text };
    }
    default: {
      throw new Error(`Unsupported tool content type: ${String(content)}`);
    }
  }
};

const normalizeToolResult = (result: RemoteToolCallResult): FastMcpContentResult => {
  if ("toolResult" in result) {
    const content: FastMcpContentResult["content"] = [
      {
        text: formatUnknownResult(result.toolResult),
        type: "text",
      },
    ];
    return { content };
  }

  return {
    content: result.content.map(normalizeToolContent),
    isError: result.isError,
  };
};

const createToolSchema = (schema: JsonSchemaRecord): McpToolSchema => {
  const validator = jsonSchemaValidator.getValidator<McpToolArguments>(schema);

  return {
    "~standard": {
      jsonSchema: {
        input: () => schema,
        output: () => schema,
      },
      validate: (value: unknown) => {
        const result = validator(value);
        if (result.valid) return { value: result.data };

        return {
          issues: [
            {
              message: result.errorMessage,
            },
          ],
        };
      },
      vendor: "ts-bun-mcp",
      version: 1,
    },
  };
};

const createMcpTransport = async (source: McpSource) => {
  const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");

  return new StdioClientTransport({
    args: source.args,
    command: source.command,
    cwd: source.cwd,
    env: source.env,
    stderr: source.stderr,
  });
};

const createToolCallError = (name: string, availableTools: string[]): Error => {
  const availableToolList = availableTools.length > 0 ? availableTools.join(", ") : "(none)";

  return new Error(`Unknown MCP tool '${name}'. Available tools: ${availableToolList}`);
};

const createConnectedTool = (client: McpCallClient, tool: RemoteTool): ConnectedMcpTool => {
  const connectedTool: ConnectedMcpTool = {
    _meta: tool._meta,
    annotations: tool.annotations,
    description: tool.description,
    inputSchema: tool.inputSchema,
    meta: tool,
    name: tool.name,
    outputSchema: tool.outputSchema,
    title: tool.title,
    toFastMcp: () => ({
      _meta: tool._meta,
      annotations: normalizeToolAnnotations(tool),
      description: tool.description,
      execute: async (args) => {
        return normalizeToolResult(
          await client.callTool({
            arguments: args,
            name: tool.name,
          }),
        );
      },
      name: tool.name,
      parameters: createToolSchema(tool.inputSchema),
    }),
  };

  return connectedTool;
};

export const connectMcpClient = async (
  source: McpSource,
  clientInfo: McpClientMetadata = MCP_CLIENT_METADATA,
): Promise<Client> => {
  const client = new Client(clientInfo, {
    capabilities: {},
  });

  await client.connect(await createMcpTransport(source));

  return client;
};

export const listMcpTools = async (client: Pick<Client, "listTools">): Promise<RemoteTool[]> => {
  const tools: RemoteTool[] = [];
  let cursor: string | undefined;

  do {
    const page = await client.listTools(cursor ? { cursor } : undefined);

    tools.push(...page.tools);
    cursor = page.nextCursor;
  } while (cursor);

  return tools;
};

export const createConnectedMcp = (client: McpCallClient, remoteTools: RemoteTool[]): ConnectedMcp => {
  const tools = remoteTools.map((tool) => createConnectedTool(client, tool));
  const toolsByName = new Map(tools.map((tool) => [tool.name, tool]));

  return {
    call: async (name, args = {}) => {
      const tool = toolsByName.get(name);
      if (!tool) {
        throw createToolCallError(
          name,
          tools.map(({ name: toolName }) => toolName),
        );
      }

      return client.callTool({
        arguments: args,
        name: tool.name,
      });
    },
    close: async () => client.close(),
    getTool: (name) => toolsByName.get(name),
    tools,
  };
};

export const connectMcp = async (
  source: McpSource,
  clientInfo: McpClientMetadata = MCP_CLIENT_METADATA,
): Promise<ConnectedMcp> => {
  const client = await connectMcpClient(source, clientInfo);
  const tools = await listMcpTools(client);

  return createConnectedMcp(client, tools);
};
