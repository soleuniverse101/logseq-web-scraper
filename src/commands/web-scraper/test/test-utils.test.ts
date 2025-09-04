import { describe, expect, test } from "vitest";
import { parseTestBlocks } from "./test-utils";

describe("parseTestBlock", () => {
  test("simple", () => {
    expect(parseTestBlocks("test")).toMatchObject([
      {
        content: "test",
        children: [],
      },
    ]);

    expect(parseTestBlocks("test1\n\ntest2")).toMatchObject([
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
    expect(parseTestBlocks("test\n  nested")).toMatchObject([
      {
        content: "test",
        children: [{ content: "nested", children: [] }],
      },
    ]);

    expect(parseTestBlocks("test\n  nested\n  nested2")).toMatchObject([
      {
        content: "test",
        children: [
          { content: "nested", children: [] },
          { content: "nested2", children: [] },
        ],
      },
    ]);
  });

  test("multiline", () => {
    expect(parseTestBlocks("test\n newline")).toMatchObject([
      {
        content: "test\nnewline",
        children: [],
      },
    ]);

    expect(
      parseTestBlocks("test\n newline\n  nested\n   newline2"),
    ).toMatchObject([
      {
        content: "test\nnewline",
        children: [{ content: "nested\nnewline2", children: [] }],
      },
    ]);
  });
});
