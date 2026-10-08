import { HTTPException } from "hono/http-exception";
import type { z } from "zod";

type ValidationResult = { success: true } | { success: false; error: z.core.$ZodError };

const describeFirstIssue = (error: z.core.$ZodError) => {
  const [issue] = error.issues;
  if (!issue) return "Invalid request";

  const path = issue.path.map(String).join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
};

export const rejectInvalidInput = (result: ValidationResult) => {
  if (result.success) return;

  throw new HTTPException(400, { message: describeFirstIssue(result.error) });
};
