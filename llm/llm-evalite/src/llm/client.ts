import "dotenv/config";
import { anthropic as _anthropic } from "@ai-sdk/anthropic";
import { google as _google } from "@ai-sdk/google";
import { openai as _openai } from "@ai-sdk/openai";
import {
  type ToolSet as AiToolSet,
  type CoreMessage,
  generateObject,
  generateText,
  type LanguageModelV1,
  type Message,
  tool,
  type ToolChoice,
} from "ai";
import { traceAISDKModel } from "evalite/ai-sdk";
import { z } from "zod";

export const anthropic = (...args: Parameters<typeof _anthropic>) => {
  const model = _anthropic(...args);
  return traceAISDKModel(model) as ReturnType<typeof _anthropic>;
};

export const google = (...args: Parameters<typeof _google>) => {
  const model = _google(...args);
  return traceAISDKModel(model) as ReturnType<typeof _google>;
};

export const openai = (...args: Parameters<typeof _openai>) => {
  const model = _openai(...args);
  return traceAISDKModel(model) as ReturnType<typeof _openai>;
};

type CompleteArgs = {
  messages?: (CoreMessage | Omit<Message, "id">)[];
  model: LanguageModelV1;
  system?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: Record<string, any>;
  toolChoice?: ToolChoice<AiToolSet>;
  functionId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  isTracingEnabled?: boolean;
};

export const complete = async ({
  messages,
  model,
  system,
  tools,
  toolChoice,
  functionId,
  metadata,
  isTracingEnabled = false,
}: CompleteArgs) => {
  let patchedTools: AiToolSet | undefined;

  if (tools) {
    patchedTools = Object.fromEntries(
      Object.entries(tools).map(([name, t]) => {
        const schema = t.zodSchema ?? z.object({});
        const aiTool = tool({
          description: t.description,
          parameters: schema,
        });
        return [name, aiTool];
      }),
    );
  }

  const result = await generateText({
    model,
    system,
    messages: messages as CoreMessage[],
    tools: patchedTools,
    toolChoice,
    maxSteps: 1,
    experimental_telemetry: isTracingEnabled ? { isEnabled: true, functionId, metadata } : undefined,
  });
  return result;
};

type CompleteStructuredArgs<T extends z.ZodTypeAny> = {
  messages?: CoreMessage[] | Omit<Message, "id">[];
  model: LanguageModelV1;
  schema: T;
  system?: string;
  functionId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  isTracingEnabled?: boolean;
};

export const completeStructured = async <T extends z.ZodTypeAny>({
  messages,
  model,
  schema,
  system,
  functionId,
  metadata,
  isTracingEnabled = false,
}: CompleteStructuredArgs<T>) => {
  const result = await generateObject<z.infer<T>>({
    model,
    system,
    messages,
    schema,
    experimental_telemetry: isTracingEnabled ? { isEnabled: true, functionId, metadata } : undefined,
  });

  return result;
};

export const llm = {
  complete,
  completeStructured,
  openai,
  anthropic,
  google,
};
