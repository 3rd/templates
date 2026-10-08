import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { readSessionCookie } from "./auth/cookies";
import { getUserForToken } from "./auth/service";
import type { SqliteDatabase } from "./db/sqlite";
import type { Env } from "./env";
import { serveClientAsset } from "./http/static";
import { appRouter } from "./trpc/router";

type AppOptions = {
  db: SqliteDatabase;
  env: Env;
};

export const createApp = ({ db, env }: AppOptions) => {
  const app = new Hono();

  app.get("/api/health", (c) =>
    c.json({
      ok: true,
      service: "react-hono-trpc",
    }),
  );

  app.all("/api/trpc/*", async (c) => {
    const user = await getUserForToken(db, readSessionCookie(c));

    return fetchRequestHandler({
      createContext: ({ resHeaders }) => ({ c, db, env, responseHeaders: resHeaders, user }),
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
    });
  });

  app.onError((error, c) => {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  });

  app.get("*", (c) => serveClientAsset(c));

  return app;
};
