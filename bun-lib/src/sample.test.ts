import { beforeEach, describe, expect, it, mock } from "bun:test";

describe("add", () => {
  let counter: number;

  beforeEach(() => {
    counter = 0;
  });

  it("should update the counter", () => {
    counter += 5;
    expect(counter).toBe(5);
  });

  it("should mock", () => {
    const targetFunction = (): string => "value";

    const mockedFunction = mock(targetFunction);
    mockedFunction.mockReturnValue("mocked");

    expect(mockedFunction()).toBe("mocked");
    expect(mockedFunction).toHaveBeenCalledTimes(1);
    expect(mockedFunction).toHaveBeenCalledWith();
  });
});
