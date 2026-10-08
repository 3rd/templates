import { z } from "zod";
import type { Message } from "ai";

const outputSchema = z.object({
  steps: z
    .array(
      z.object({
        subExpression: z.string().describe("The sub-expression computed in this step"),
        description: z.string().describe("The description of this step"),
        result: z.string().describe("The result of this step"),
      }),
    )
    .describe("Calculation step"),
  result: z.number().describe("The final result").nullable(),
});

export const buildExamplePrompt = (args: { expression: string }) => {
  const messages: Omit<Message, "id">[] = [];

  const systemPrompt = `
    You are a helpful assistant that performs mathematical operations and returns the result.
  `;

  const userPrompt = `
    Evaluate: ${args.expression}
  `;

  messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userPrompt });

  return { messages, outputSchema };
};
