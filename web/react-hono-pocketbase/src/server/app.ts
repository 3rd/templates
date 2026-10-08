import { zValidator } from "@hono/zod-validator";
import { Hono, type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createTaskSchema, updateTaskSchema, authSchema, taskPageSchema } from "../shared/schemas";
import { clearSessionCookie, readSessionCookie, writeSessionCookie } from "./auth/cookies";
import type { Env } from "./env";
import { serveClientAsset } from "./http/static";
import { rejectInvalidInput } from "./http/validation";
import { type PocketBaseGateway, PocketBaseGatewayError } from "./pocketbase/gateway";

type AppOptions = {
  env: Env;
  pocketbase: PocketBaseGateway;
};

const requireSessionToken = (c: Context): string => {
  const token = readSessionCookie(c);
  if (!token) {
    throw new HTTPException(401, { message: "Authentication required" });
  }

  return token;
};

export const createApp = ({ env, pocketbase }: AppOptions) => {
  const app = new Hono();

  const api = new Hono()
    .get("/health", (c) =>
      c.json({
        ok: true,
        service: "react-hono-pocketbase",
      }),
    )
    .get("/auth/me", async (c) => {
      const token = readSessionCookie(c);
      if (!token) return c.json({ user: null }, 401);

      const session = await pocketbase.currentSession(token);
      return c.json({ user: session.user });
    })
    .post("/auth/register", zValidator("json", authSchema, rejectInvalidInput), async (c) => {
      const session = await pocketbase.register(c.req.valid("json"));
      writeSessionCookie(c, session.token, env);
      return c.json({ user: session.user }, 201);
    })
    .post("/auth/login", zValidator("json", authSchema, rejectInvalidInput), async (c) => {
      const session = await pocketbase.login(c.req.valid("json"));
      writeSessionCookie(c, session.token, env);
      return c.json({ user: session.user });
    })
    .post("/auth/logout", (c) => {
      pocketbase.logout(readSessionCookie(c));
      clearSessionCookie(c);
      return c.json({ ok: true });
    })
    .get("/tasks", zValidator("query", taskPageSchema, rejectInvalidInput), async (c) => {
      const session = await pocketbase.currentSession(requireSessionToken(c));
      return c.json(await pocketbase.listTasks(session, c.req.valid("query")));
    })
    .post("/tasks", zValidator("json", createTaskSchema, rejectInvalidInput), async (c) => {
      const session = await pocketbase.currentSession(requireSessionToken(c));
      return c.json({ task: await pocketbase.createTask(session, c.req.valid("json")) }, 201);
    })
    .patch("/tasks/:id", zValidator("json", updateTaskSchema, rejectInvalidInput), async (c) => {
      const session = await pocketbase.currentSession(requireSessionToken(c));
      return c.json({ task: await pocketbase.updateTask(session, c.req.param("id"), c.req.valid("json")) });
    })
    .delete("/tasks/:id", async (c) => {
      const session = await pocketbase.currentSession(requireSessionToken(c));
      await pocketbase.deleteTask(session, c.req.param("id"));
      return c.json({ ok: true });
    });

  const routes = app.route("/api", api);

  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ error: error.message }, error.status);

    if (error instanceof PocketBaseGatewayError) {
      const status = [400, 401, 403, 404, 409, 500].includes(error.status) ? error.status : 500;
      return c.json({ error: error.message }, status as 400 | 401 | 403 | 404 | 409 | 500);
    }

    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  });

  app.get("*", serveClientAsset);

  return routes;
};

export type AppType = ReturnType<typeof createApp>;
