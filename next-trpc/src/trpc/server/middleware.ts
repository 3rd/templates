import { TRPCError } from "@trpc/server";
import { middleware, publicProcedure } from "./context";

export const isAuthenticated = middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({ ctx });
});

export const isAdmin = middleware(async (opts) => {
  const { ctx } = opts;
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({ ctx });
});

export const authenticatedProcedure = publicProcedure.use(isAuthenticated);
export const adminProcedure = publicProcedure.use(isAdmin);
export { publicProcedure };
