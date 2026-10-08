import { authRouter } from "./routers/auth";
import { tasksRouter } from "./routers/tasks";
import { router } from "./base";

export const appRouter = router({
  auth: authRouter,
  tasks: tasksRouter,
});

export type AppRouter = typeof appRouter;
