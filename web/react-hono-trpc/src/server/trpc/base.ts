import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import type { TrpcContext } from "./context";

const describeFirstIssue = (error: ZodError) => {
  const [issue] = error.issues;
  if (!issue) return "Invalid request";

  const path = issue.path.map(String).join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
};

const t = initTRPC.context<TrpcContext>().create({
  errorFormatter: ({ error, shape }) =>
    error.cause instanceof ZodError ? { ...shape, message: describeFirstIssue(error.cause) } : shape,
});

export const publicProcedure = t.procedure;
export const router = t.router;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
