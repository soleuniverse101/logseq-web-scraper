import { describe, expect, test } from "vitest";
import { Interpreter } from ".";
import { Parser } from "../parser";
import { parseTestBlocks } from "../test";
import { ok } from "neverthrow";

describe("interpreter (full integration)", () => {
  test("simple fetch + block", async () => {
    expect(
      await Interpreter.interpret(
        Parser.parse(
          parseTestBlocks(
            "https://mrrobot.fandom.com/wiki/Mr._Robot\n  .mw-page-title-main",
          ),
        )._unsafeUnwrap(),
      ),
    ).toMatchObject(
      ok([
        {
          content: "Mr. Robot | Mr. Robot Wiki | Fandom",
          children: [{ content: "Mr. Robot" }],
        },
      ]),
    );
  });
});
