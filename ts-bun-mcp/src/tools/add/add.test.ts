import { describe, expect, it } from "bun:test";
import { addNumbers } from "@/tools/add/add";

describe("addNumbers", () => {
  it("returns the sum of two numbers", () => {
    expect(addNumbers(2, 3)).toBe(5);
  });
});
