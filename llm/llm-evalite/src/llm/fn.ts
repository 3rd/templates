import p from "picocolors";
import { z } from "zod";

export const fn = <Input extends {}, Output>(props: {
  description: string;
  schema?: z.ZodType<Input>;
  handler: (input: Input) => Promise<Output>;
}) => {
  const validate = (input: Input) => {
    if (!props.schema) return;
    const validation = props.schema.safeParse(input);
    if (validation.success) return;
    const errors = validation.error.issues.map((issue) => {
      const clone: Record<string, unknown> = { ...issue };
      clone.path = issue.path.join(".");
      return clone;
    });
    console.log(p.red(`Validation error:`), errors);
    throw new Error(JSON.stringify(errors));
  };

  return {
    description: props.description,
    zodSchema: props.schema,
    run: async (input: Input) => {
      validate(input);
      return props.handler(input);
    },
  };
};

export type ToolSet = Record<string, ReturnType<typeof fn>>;
export type Tool = ReturnType<typeof fn>;
