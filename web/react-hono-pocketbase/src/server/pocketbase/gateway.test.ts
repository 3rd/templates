// @vitest-environment node

import { expect, test, vi } from "vitest";
import { createPocketBaseGateway } from "./gateway";

test("validating a session retains its original expiry token instead of the renewed credential", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({
    token: "renewed-token",
    record: {
      id: "a00000000000001",
      collectionId: "_pb_users_auth_",
      collectionName: "users",
      email: "ada@example.com",
      created: "2026-01-01 00:00:00.000Z",
      updated: "2026-01-01 00:00:00.000Z",
    },
  }));
  const gateway = createPocketBaseGateway("http://pocketbase.test");

  await expect(gateway.currentSession("original-token")).resolves.toEqual({
    token: "original-token",
    user: { id: "a00000000000001", email: "ada@example.com" },
  });
});
