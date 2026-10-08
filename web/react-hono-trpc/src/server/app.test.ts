// @vitest-environment node

import { describe, expect, test } from "vitest";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import { createApp } from "./app";
import { createSession } from "./auth/service";
import { migrate } from "./db/migrations";
import { createSqliteDatabase } from "./db/sqlite";
import { env } from "./env";
import type { AppRouter } from "./trpc/router";

const createTestApp = async () => {
  const db = await createSqliteDatabase(":memory:");
  migrate(db);
  return createApp({ db, env });
};

const createClient = (app: Awaited<ReturnType<typeof createTestApp>>) => {
  let cookie = "";

  return createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        fetch: async (input, init) => {
          const headers = new Headers(init?.headers);
          if (cookie) headers.set("cookie", cookie);
          const response = await app.fetch(new Request(input, { ...init, headers }));
          cookie = response.headers.get("set-cookie")?.split(";")[0] ?? cookie;
          return response;
        },
        url: "http://localhost/api/trpc",
      }),
    ],
  });
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
    const client = createTRPCProxyClient<AppRouter>({
      links: [httpLink({
        url: "http://localhost/api/trpc",
        fetch: (input, init) => Promise.resolve(app.fetch(new Request(input, { ...init, headers: { ...Object.fromEntries(new Headers(init?.headers)), cookie: `app_session=${session.token}` } }))),
      })],
    });
    const first = await client.tasks.list.query();
    expect(first.hasNext).toBe(true);
    expect(first.tasks.map((task) => task.title)).toEqual(Array.from({ length: 20 }, (_, index) => `Task ${21 - index}`));

    const cursor = { beforeCreatedAt: "2026-01-01T00:00:00.000Z", beforeId: "00000000-0000-4000-8000-000000000002" };
    await client.tasks.create.mutate({ title: "New task" });
    await expect(client.tasks.list.query(cursor)).resolves.toMatchObject({ hasNext: false, tasks: [{ title: "Task 1" }] });
    await client.tasks.delete.mutate({ id: "00000000-0000-4000-8000-000000000001" });
    await expect(client.tasks.list.query(cursor)).resolves.toEqual({ hasNext: false, tasks: [] });

    await expect(client.tasks.list.query({ beforeId: "missing-date" })).rejects.toMatchObject({ data: { code: "BAD_REQUEST" } });
    await expect(client.tasks.list.query({ beforeId: "task", beforeCreatedAt: "invalid" })).rejects.toMatchObject({ data: { code: "BAD_REQUEST" } });
  });

  test("registers, reads the session, and manages tasks", async () => {
    const client = createClient(await createTestApp());

    await expect(client.auth.register.mutate({ email: "ada@example.com", password: "password123" })).resolves.toMatchObject({
      user: { email: "ada@example.com" },
    });
    await expect(client.auth.me.query()).resolves.toMatchObject({ user: { email: "ada@example.com" } });
    await expect(client.tasks.create.mutate({ title: "Ship template" })).resolves.toMatchObject({
      task: { title: "Ship template" },
    });
    await expect(client.tasks.list.query()).resolves.toMatchObject({ tasks: [{ title: "Ship template" }] });
  });

  test("rejects protected routes without a session", async () => {
    const client = createClient(await createTestApp());

    await expect(client.tasks.list.query()).rejects.toThrow("Authentication required");
  });

  test("classifies invalid credentials and duplicate registration as client errors", async () => {
    const client = createClient(await createTestApp());
    const input = { email: "Ada@example.com", password: "password123" };
    const results = await Promise.allSettled([client.auth.register.mutate(input), client.auth.register.mutate(input)]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);

    const failure = results.find((result) => result.status === "rejected");
    expect(failure).toMatchObject({ status: "rejected", reason: { data: { code: "CONFLICT", httpStatus: 409 } } });
    await expect(client.auth.register.mutate(input)).rejects.toMatchObject({ data: { code: "CONFLICT", httpStatus: 409 } });
    await expect(client.auth.login.mutate({ ...input, password: "wrong-password" })).rejects.toMatchObject({
      data: { code: "UNAUTHORIZED", httpStatus: 401 },
    });
  });

  test("reports the failing field in the error message for invalid input", async () => {
    const client = createClient(await createTestApp());

    await expect(client.auth.register.mutate({ email: "ada@example.com", password: "short" })).rejects.toMatchObject({
      data: { code: "BAD_REQUEST" },
      message: expect.stringMatching(/^password: /),
    });
  });
});
