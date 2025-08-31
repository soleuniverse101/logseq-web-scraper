import { describe, expect, test } from "vitest";
import { Interpreter, OutputNode } from ".";
import { Parser } from "../parser";
import { parseTestBlocks } from "../test";
import { ok } from "neverthrow";

describe("interpreter (full integration)", () => {
  test("simple fetch", async () => {
    const blocks = Parser.parse(
      parseTestBlocks("https://www.google.com"),
    )._unsafeUnwrap();
    expect(await Interpreter.interpret(blocks)).toMatchObject(
      ok([
        { content: "Google", children: [] } satisfies Omit<
          OutputNode,
          "context"
        >,
      ]),
    );
  });
});
