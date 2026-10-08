import { describe, expect, test } from "bun:test";
import { createGreeting } from "./index";

describe("createGreeting", () => {
  test("greets trimmed names", () => {
    expect(createGreeting(" Ada ")).toBe("hello Ada");
  });

  test("rejects blank names", () => {
    expect(() => createGreeting("   ")).toThrow("name is required");
  });
});
