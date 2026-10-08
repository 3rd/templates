import { describe, expect, test } from "bun:test";
import { addNumbers } from "./add";

describe("addNumbers", () => {
  test("returns the sum of two numbers", () => {
    expect(addNumbers(2, 3)).toBe(5);
  });
});
