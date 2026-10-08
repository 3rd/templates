// @vitest-environment node

import { describe, expect, test, vi } from "vitest";
import { TASK_PAGE_SIZE, type Task, type User } from "../shared/schemas";
import { createApp } from "./app";
import { env } from "./env";
import type { PocketBaseGateway, PocketBaseSession } from "./pocketbase/gateway";

const user: User = {
  email: "ada@example.com",
  id: "user_1",
};

const createFakePocketBase = (): PocketBaseGateway => {
  const tasks = new Map<string, Task>();
  let nextId = 1;

  const session: PocketBaseSession = {
    token: "session-token",
    user,
  };

  return {
    async createTask(_session, input) {
      const now = new Date().toISOString();
      const task = {
        completed: false,
        createdAt: now,
        id: `task_${nextId++}`,
        title: input.title,
        updatedAt: now,
      };
      tasks.set(task.id, task);
      return task;
    },
    async currentSession(token) {
      if (token !== session.token) throw new Error("Invalid test token");
      return session;
    },
    async deleteTask(_session, id) {
      tasks.delete(id);
    },
    async listTasks() {
      return { tasks: [...tasks.values()].slice(0, TASK_PAGE_SIZE), hasNext: tasks.size > TASK_PAGE_SIZE };
    },
    async login() {
      return session;
    },
    logout() {},
    async register() {
      return session;
    },
    async updateTask(_session, id, input) {
      const task = tasks.get(id);
      if (!task) throw new Error("Task not found");
      const updated: Task = {
        ...task,
        completed: input.completed ?? task.completed,
        title: input.title ?? task.title,
        updatedAt: new Date().toISOString(),
      };
      tasks.set(id, updated);
      return updated;
    },
  };
};

const createTestApp = () => createApp({ env, pocketbase: createFakePocketBase() });

const readCookie = (response: Response) => {
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) {
    throw new Error("Expected a session cookie");
  }

  return cookie;
};

describe("api", () => {
  test("does not restore a cookie when an earlier authenticated request completes after logout", async () => {
    const pocketbase = createFakePocketBase();
    const pendingSession = Promise.withResolvers<PocketBaseSession>();
    const didStart = Promise.withResolvers<void>();
    vi.spyOn(pocketbase, "currentSession").mockImplementation(() => {
      didStart.resolve();
      return pendingSession.promise;
    });

    const app = createApp({ env, pocketbase });
    const headers = { cookie: "pb_session=session-token" };
    const pendingResponse = app.request("/api/auth/me", { headers });
    await didStart.promise;

    const logout = await app.request("/api/auth/logout", { headers, method: "POST" });
    expect(logout.headers.get("set-cookie")).toContain("Max-Age=0");

    pendingSession.resolve({ token: "session-token", user });
    const response = await pendingResponse;
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  test("registers, reads the session, and manages tasks through the Hono facade", async () => {
    const app = createTestApp();

    const register = await app.request("/api/auth/register", {
      body: JSON.stringify({ email: "ada@example.com", password: "password123" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(register.status).toBe(201);
    const cookie = readCookie(register);
    expect(cookie).toContain("pb_session=");

    const me = await app.request("/api/auth/me", { headers: { cookie } });
    expect(me.status).toBe(200);
    expect(me.headers.get("set-cookie")).toBeNull();
    await expect(me.json()).resolves.toMatchObject({ user: { email: "ada@example.com" } });

    const createTask = await app.request("/api/tasks", {
      body: JSON.stringify({ title: "Ship template" }),
      headers: { "content-type": "application/json", cookie },
      method: "POST",
    });
    expect(createTask.status).toBe(201);
    expect(createTask.headers.get("set-cookie")).toBeNull();

    const tasks = await app.request("/api/tasks", { headers: { cookie } });
    expect(tasks.headers.get("set-cookie")).toBeNull();
    await expect(tasks.json()).resolves.toMatchObject({ tasks: [{ title: "Ship template" }] });
  });

  test("rejects protected routes without a session", async () => {
    const app = createTestApp();

    const response = await app.request("/api/tasks");

    expect(response.status).toBe(401);
  });

  test("rejects malformed or partial task cursors before querying PocketBase", async () => {
    const app = createTestApp();
    const headers = { cookie: "pb_session=session-token" };

    const partial = await app.request("/api/tasks?beforeId=missing-date", { headers });
    expect(partial.status).toBe(400);

    const malformed = await app.request("/api/tasks?beforeId=task&beforeCreatedAt=invalid", { headers });
    expect(malformed.status).toBe(400);
  });

  test("reports the failing field in the error envelope for invalid input", async () => {
    const app = createTestApp();

    const response = await app.request("/api/auth/register", {
      body: JSON.stringify({ email: "ada@example.com", password: "short" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: expect.stringMatching(/^password: /) });
  });
});
