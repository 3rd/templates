import type { McpServer } from "#mcp/server";
import { z } from "zod/v4";

export const addNumbers = (a: number, b: number): number => a + b;

export const registerAddTool = (server: McpServer): void => {
  server.registerTool(
    "add",
    {
      title: "Add",
      description: "Add two numbers together.",
      inputSchema: {
        a: z.number().describe("The first number."),
        b: z.number().describe("The second number."),
      },
    },
    ({ a, b }) => ({
      content: [
        {
          type: "text",
          text: String(addNumbers(a, b)),
        },
      ],
    })
  );
};
