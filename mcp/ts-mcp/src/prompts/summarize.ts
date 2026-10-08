import type { McpServer } from "#mcp/server";
import {
  ErrorCode,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  McpError,
} from "#mcp/types";
import { z } from "zod/v4";

const createSummaryPrompt = (topic = "this project"): string =>
  `Summarize ${topic} in three concise bullet points.`;

export const registerSummarizePrompt = (server: McpServer): void => {
  const argsSchema = z.object({
    topic: z.string().trim().min(1).optional(),
  });

  server.server.registerCapabilities({ prompts: { listChanged: true } });
  server.server.setRequestHandler(ListPromptsRequestSchema, () => ({
    prompts: [
      {
        name: "summarize",
        title: "Summarize",
        description: "Create a short summary prompt for a topic.",
        arguments: [{ name: "topic", description: "Topic to summarize", required: false }],
      },
    ],
  }));
  server.server.setRequestHandler(GetPromptRequestSchema, (request) => {
    if (request.params.name !== "summarize") {
      throw new McpError(ErrorCode.InvalidParams, `Prompt ${request.params.name} not found`);
    }

    const result = argsSchema.safeParse(request.params.arguments ?? {});
    if (!result.success) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid arguments for prompt summarize: ${result.error.message}`
      );
    }

    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: createSummaryPrompt(result.data.topic),
          },
        },
      ],
    };
  });
};
