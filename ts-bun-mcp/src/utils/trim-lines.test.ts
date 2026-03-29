import { describe, expect, it } from "bun:test";
import { trimLines } from "@/utils/trim-lines";

describe("trimLines", () => {
  it("removes the shared indentation from a multiline string", () => {
    expect(
      trimLines(`
        first line
        second line
          nested line
      `),
    ).toBe(
      trimLines(`
      first line
      second line
        nested line
    `),
    );
  });

  it("ignores blank outer lines and preserves inner blank lines", () => {
    expect(
      trimLines(`
        first line

        third line
      `),
    ).toBe(
      trimLines(`
      first line

      third line
    `),
    );
  });
});
