import { describe, expect, test } from "vitest";
import { Parser } from ".";
import { parseTestBlock } from "../test";
import { ok } from "neverthrow";

describe("Parser", () => {
  test("simple", () => {
    expect(
      Parser.parse(parseTestBlock("test"))._unsafeUnwrapErr(),
    ).toMatchObject({ message: "Parsing failed on line 1 :\nInvalid URL" });

    expect(
      Parser.parse(parseTestBlock("https://soleuniverse.me")),
    ).toMatchObject(
      ok([
        {
          content: "https://soleuniverse.me",
          astNode: {
            type: "root",
            url: new URL("https://soleuniverse.me"),
          },
          children: [],
        },
      ]),
    );
  });
});
