import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/trpc/server/router";

export const trpc = createTRPCReact<AppRouter>();
