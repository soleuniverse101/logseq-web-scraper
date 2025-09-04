import { describe, expect, test } from "vitest";
import { parseASTNode } from "./parser";
import { ASTNode } from ".";
import { ok } from "neverthrow";

describe("parseASTNode", () => {
  test("block", () => {
    expect(parseASTNode("?, @inline, selector\ntest{}")).toEqual(
      ok({
        type: "block",
        selector: "selector",
        quantifier: "?",
        modes: { context: "inline" },
        template: ["test", null],
      } satisfies ASTNode),
    );
  });
});
