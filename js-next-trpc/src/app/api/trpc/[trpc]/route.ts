import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@/trpc/server/context";
import { appRouter } from "@/trpc/server/router";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
}

export { handler as GET, handler as POST };
