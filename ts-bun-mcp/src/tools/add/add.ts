import { z } from "zod";
import type { FastMCP } from "fastmcp";

export const addNumbers = (a: number, b: number) => a + b;

export const registerAddTool = (server: FastMCP) => {
  server.addTool({
    description: "Add two numbers together.",
    execute: async ({ a, b }) => String(addNumbers(a, b)),
    name: "add",
    parameters: z.object({
      a: z.number().describe("The first number."),
      b: z.number().describe("The second number."),
    }),
  });
};
