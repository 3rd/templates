import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Elysia } from "elysia";
import { appRouter, createContext } from "./trpc";

type ServerConfig = {
  version: string;
  port: number | string;
};

export const createServer = (config: ServerConfig) => {
  const app = new Elysia()
    .use(
      swagger({
        path: "/api/docs",
        documentation: {
          info: {
            title: "My Project API",
            version: config.version,
          },
        },
        scalarConfig: {
          darkMode: true,
        },
      }),
    )
    .use(cors())
    .all("/api/trpc/*", async (opts) => {
      const res = await fetchRequestHandler({
        endpoint: "/api/trpc",
        router: appRouter,
        req: opts.request,
        createContext,
      });
      return res;
    })
    .get("/health", () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    }))
    .listen({ port: config.port, idleTimeout: 60 });

  console.log(`🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`);
  console.log(`📚 API docs at http://localhost:3000/api/docs`);

  return app;
};
