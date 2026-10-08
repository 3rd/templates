// @vitest-environment node

import { describe, expect, test } from "vitest";
import { createApp } from "./app";
import { createSession } from "./auth/service";
import { migrate } from "./db/migrations";
import { createSqliteDatabase } from "./db/sqlite";
import { env } from "./env";

const createTestApp = async () => {
  const db = await createSqliteDatabase(":memory:");
  migrate(db);
  return createApp({ db, env });
};

const readCookie = (response: Response) => {
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  if (!cookie) {
    throw new Error("Expected a session cookie");
  }

  return cookie;
};

describe("api", () => {
  test("pages tied task timestamps without leaking another owner or shifting after writes", async () => {
    const db = await createSqliteDatabase(":memory:");
    migrate(db);
    db.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
      .run("owner", "owner@example.com", "unused", "2026-01-01T00:00:00.000Z");
    db.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)")
      .run("other", "other@example.com", "unused", "2026-01-01T00:00:00.000Z");

    for (let index = 1; index <= 21; index += 1) {
      db.prepare("INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(`00000000-0000-4000-8000-${String(index).padStart(12, "0")}`, "owner", `Task ${index}`, 0, "2026-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z");
    }

    db.prepare("INSERT INTO tasks (id, user_id, title, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
      .run("other-task", "other", "Private task", 0, "2026-02-01T00:00:00.000Z", "2026-02-01T00:00:00.000Z");
    const session = await createSession(db, "owner");
    const app = createApp({ db, env });
    const headers = { cookie: `app_session=${session.token}` };
    const first = await app.request("/api/tasks", { headers });
    await expect(first.json()).resolves.toMatchObject({
      hasNext: true,
      tasks: Array.from({ length: 20 }, (_, index) => ({ title: `Task ${21 - index}` })),
    });

    const cursor = new URLSearchParams({ beforeCreatedAt: "2026-01-01T00:00:00.000Z", beforeId: "00000000-0000-4000-8000-000000000002" });
    const created = await app.request("/api/tasks", { method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify({ title: "New task" }) });
    expect(created.status).toBe(201);

    const last = await app.request(`/api/tasks?${cursor}`, { headers });
    await expect(last.json()).resolves.toMatchObject({ hasNext: false, tasks: [{ title: "Task 1" }] });

    const removed = await app.request("/api/tasks/00000000-0000-4000-8000-000000000001", { method: "DELETE", headers });
    expect(removed.status).toBe(200);
    const empty = await app.request(`/api/tasks?${cursor}`, { headers });
    await expect(empty.json()).resolves.toEqual({ hasNext: false, tasks: [] });

    const invalid = await app.request("/api/tasks?beforeId=missing-date", { headers });
    expect(invalid.status).toBe(400);

    const malformed = await app.request("/api/tasks?beforeId=task&beforeCreatedAt=invalid", { headers });
    expect(malformed.status).toBe(400);
  });

  test("registers, reads the session, and manages tasks", async () => {
    const app = await createTestApp();

    const register = await app.request("/api/auth/register", {
      body: JSON.stringify({ email: "ada@example.com", password: "password123" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(register.status).toBe(201);
    const cookie = readCookie(register);
    expect(cookie).toContain("app_session=");

    const me = await app.request("/api/auth/me", { headers: { cookie } });
    expect(me.status).toBe(200);
    await expect(me.json()).resolves.toMatchObject({ user: { email: "ada@example.com" } });

    const createTask = await app.request("/api/tasks", {
      body: JSON.stringify({ title: "Ship template" }),
      headers: { "content-type": "application/json", cookie },
      method: "POST",
    });
    expect(createTask.status).toBe(201);

    const tasks = await app.request("/api/tasks", { headers: { cookie } });
    await expect(tasks.json()).resolves.toMatchObject({ tasks: [{ title: "Ship template" }] });
  });

  test("rejects protected routes without a session", async () => {
    const app = await createTestApp();

    const response = await app.request("/api/tasks");

    expect(response.status).toBe(401);
  });

  test("reports conflicts for mixed-case and concurrent duplicate registrations", async () => {
    const app = await createTestApp();

    const register = () => app.request("/api/auth/register", {
      body: JSON.stringify({ email: "Ada@example.com", password: "password123" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    const responses = await Promise.all([register(), register()]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect((await register()).status).toBe(409);
  });

  test("reports the failing field in the error envelope for invalid input", async () => {
    const app = await createTestApp();

    const response = await app.request("/api/auth/register", {
      body: JSON.stringify({ email: "ada@example.com", password: "short" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: expect.stringMatching(/^password: /) });
  });
});
