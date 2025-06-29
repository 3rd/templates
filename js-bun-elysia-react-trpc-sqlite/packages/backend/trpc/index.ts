import { z } from "zod";
import { userRouter } from "./routers/users";
import { createContext, publicProcedure, router } from "./setup";

export const appRouter = router({
  hello: publicProcedure.input(z.object({ name: z.string().optional() })).query(({ input }) => {
    return {
      message: `Hello ${input.name ?? "World"}!`,
      timestamp: new Date().toISOString(),
    };
  }),
  users: userRouter,
});

export type AppRouter = typeof appRouter;
export { createContext };
