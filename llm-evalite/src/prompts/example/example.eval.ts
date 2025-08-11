import { evalite } from "evalite";
import { completeStructured, openai } from "../../llm";
import { buildExamplePrompt } from "./example";

type TestCase = {
  expression: string;
  expected: {
    stepCount: number;
    result: number;
  };
};

const testCases: TestCase[] = [
  {
    expression: "1 + 1",
    expected: {
      stepCount: 1,
      result: 2,
    },
  },
  {
    expression: "sqrt(pow(2, 2) + pow(2, 5))",
    expected: {
      stepCount: 4,
      result: 6,
    },
  },
];

const model = openai("gpt-4.1");
// const model = anthropic("claude-4-sonnet-20250514");

evalite("Mathematical expression evaluation", {
  data: async () => testCases.map((item) => ({ input: item })),
  task: async (testCase) => {
    const { messages, outputSchema } = buildExamplePrompt(testCase);
    const result = await completeStructured({
      model,
      messages,
      schema: outputSchema,
    });
    return result.object;
  },

  scorers: [
    // check step count
    {
      name: "Step count accuracy",
      description: "Whether the number of steps is correct",
      scorer: ({ input, output }) => {
        return {
          score: output.steps.length === input.expected.stepCount ? 1 : 0,
          metadata: {
            expected: input.expected.stepCount,
            predicted: output.steps.length,
          },
        };
      },
    },

    // check end result
    {
      name: "Result accuracy",
      description: "Whether the result is correct",
      scorer: ({ input, output }) => {
        return {
          score: output.result === input.expected.result ? 1 : 0,
          expected: input.expected.result,
          predicted: output.result,
        };
      },
    },
  ],

  columns: async (result) => [
    { label: "Expression", value: result.input.expression },
    { label: "Step Count", value: result.output.steps.length },
    { label: "Result", value: result.output.result },
  ],
});
