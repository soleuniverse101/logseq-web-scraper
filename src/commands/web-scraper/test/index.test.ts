import { describe, expect, test } from "vitest";
import { parseTestBlock } from ".";

describe("parseTestBlock", () => {
  test("simple", () => {
    expect(parseTestBlock("test")).toMatchObject([
      {
        content: "test",
        children: [],
      },
    ]);

    expect(parseTestBlock("test1\n\ntest2")).toMatchObject([
      {
        content: "test1",
        children: [],
      },
      {
        content: "",
        children: [],
      },
      {
        content: "test2",
        children: [],
      },
    ]);
  });

  test("nested", () => {
    expect(parseTestBlock("test\n  nested")).toMatchObject([
      {
        content: "test",
        children: [{ content: "nested", children: [] }],
      },
    ]);

    expect(parseTestBlock("test\n  nested\n  nested2")).toMatchObject([
      {
        content: "test",
        children: [
          { content: "nested", children: [] },
          { content: "nested2", children: [] },
        ],
      },
    ]);
  });
});
