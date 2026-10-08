import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authSchema, createTaskSchema, taskPageSchema, updateTaskSchema } from "../shared/schemas";
import { clearSessionCookie, readSessionCookie, writeSessionCookie } from "./auth/cookies";
import type { SessionUser } from "./auth/repository";
import { createSession, getUserForToken, loginUser, logoutToken, registerUser } from "./auth/service";
import type { SqliteDatabase } from "./db/sqlite";
import type { Env } from "./env";
import { serveClientAsset } from "./http/static";
import { rejectInvalidInput } from "./http/validation";
import { createTask, deleteTask, listTasks, updateTask } from "./tasks/repository";

type Variables = {
  user: SessionUser | undefined;
};

type AppOptions = {
  db: SqliteDatabase;
  env: Env;
};

const requireUser = (user: SessionUser | undefined): SessionUser => {
  if (!user) {
    throw new HTTPException(401, { message: "Authentication required" });
  }

  return user;
};

export const createApp = ({ db, env }: AppOptions) => {
  const app = new Hono<{ Variables: Variables }>();

  app.use("/api/*", async (c, next) => {
    c.set("user", await getUserForToken(db, readSessionCookie(c)));
    await next();
  });

  const api = new Hono<{ Variables: Variables }>()
    .get("/health", (c) =>
      c.json({
        ok: true,
        service: "react-hono",
      }),
    )
    .get("/auth/me", (c) => {
      const user = c.get("user");
      if (!user) return c.json({ user: null }, 401);

      return c.json({ user });
    })
    .post("/auth/register", zValidator("json", authSchema, rejectInvalidInput), async (c) => {
      const user = await registerUser(db, c.req.valid("json"));
      const session = await createSession(db, user.id);
      writeSessionCookie(c, session.token, session.expiresAt, env);
      return c.json({ user }, 201);
    })
    .post("/auth/login", zValidator("json", authSchema, rejectInvalidInput), async (c) => {
      const user = await loginUser(db, c.req.valid("json"));
      const session = await createSession(db, user.id);
      writeSessionCookie(c, session.token, session.expiresAt, env);
      return c.json({ user });
    })
    .post("/auth/logout", async (c) => {
      await logoutToken(db, readSessionCookie(c));
      clearSessionCookie(c);
      return c.json({ ok: true });
    })
    .get("/tasks", zValidator("query", taskPageSchema, rejectInvalidInput), (c) => {
      const user = requireUser(c.get("user"));
      return c.json(listTasks(db, user.id, c.req.valid("query")));
    })
    .post("/tasks", zValidator("json", createTaskSchema, rejectInvalidInput), (c) => {
      const user = requireUser(c.get("user"));
      return c.json({ task: createTask(db, user.id, c.req.valid("json").title) }, 201);
    })
    .patch("/tasks/:id", zValidator("json", updateTaskSchema, rejectInvalidInput), (c) => {
      const user = requireUser(c.get("user"));
      const task = updateTask(db, user.id, c.req.param("id"), c.req.valid("json"));
      if (!task) {
        throw new HTTPException(404, { message: "Task not found" });
      }

      return c.json({ task });
    })
    .delete("/tasks/:id", (c) => {
      const user = requireUser(c.get("user"));
      if (!deleteTask(db, user.id, c.req.param("id"))) {
        throw new HTTPException(404, { message: "Task not found" });
      }

      return c.json({ ok: true });
    });

  const routes = app.route("/api", api);

  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ error: error.message }, error.status);

    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  });

  app.get("*", serveClientAsset);

  return routes;
};

export type AppType = ReturnType<typeof createApp>;
