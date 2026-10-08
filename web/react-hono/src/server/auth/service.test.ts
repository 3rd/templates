// @vitest-environment node

import { expect, test } from "vitest";
import { migrate } from "../db/migrations";
import { createSqliteDatabase } from "../db/sqlite";
import { insertSession } from "./repository";
import { createSession, getUserForToken, registerUser } from "./service";

test("creating a session prunes a bounded expired batch without invalidating live sessions", async () => {
  const db = await createSqliteDatabase(":memory:");
  migrate(db);
  const user = await registerUser(db, { email: "ada@example.com", password: "password123" });
  const liveSession = await createSession(db, user.id);

  for (let index = 0; index < 101; index += 1) {
    insertSession(db, {
      id: `expired-${index}`,
      userId: user.id,
      tokenHash: `expired-hash-${index}`,
      createdAt: "2000-01-01T00:00:00.000Z",
      expiresAt: "2000-01-02T00:00:00.000Z",
    });
  }

  await createSession(db, user.id);
  expect(db.prepare("SELECT COUNT(*) AS count FROM sessions WHERE expires_at <= ?").get("2000-01-02T00:00:00.000Z")).toEqual({ count: 1 });
  await expect(getUserForToken(db, liveSession.token)).resolves.toEqual(user);

  await createSession(db, user.id);
  expect(db.prepare("SELECT COUNT(*) AS count FROM sessions WHERE expires_at <= ?").get("2000-01-02T00:00:00.000Z")).toEqual({ count: 0 });
});
