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

    expect(
      Parser.parse(
        parseTestBlock(`https://soleuniverse.me
  h1
  +, ul
    @inline, li.class`),
      ),
    ).toMatchObject(
      ok([
        {
          content: "https://soleuniverse.me",
          astNode: {
            type: "root",
            url: new URL("https://soleuniverse.me"),
          },
          children: [
            {
              content: "h1",
              astNode: {
                type: "block",
                selector: "h1",
                modes: [],
              },
              children: [],
            },
            {
              content: "+, ul",
              astNode: {
                type: "block",
                selector: "ul",
                modes: [],
                quantifier: "+",
              },
              children: [
                {
                  content: "@inline, li.class",
                  astNode: {
                    type: "block",
                    selector: "li.class",
                    modes: ["inline"],
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      ]),
    );
  });
});
