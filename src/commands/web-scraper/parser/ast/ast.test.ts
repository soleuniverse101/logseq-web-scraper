import { describe, expect, test } from "vitest";
import { parseASTNode } from "./parser";
import { ASTNode } from ".";
import { ok } from "neverthrow";

describe("parseASTNode", () => {
  test("block", () => {
    expect(parseASTNode("?, @zip, selector\ntest{}")).toEqual(
      ok({
        type: "block",
        selector: "selector",
        quantifier: "?",
        modes: { zip: true },
        template: ["test", null],
      } satisfies ASTNode),
    );
  });
});
