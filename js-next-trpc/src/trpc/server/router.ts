import { publicProcedure, router } from "./context";

const testRouter = router({
  check: publicProcedure.query(() => "test"),
});

export const appRouter = router({
  test: testRouter,
});

export type AppRouter = typeof appRouter;
