import { err, ok } from "neverthrow";
import { describe, expect, test } from "vitest";
import { testParse } from "../test/test-utils";

describe("Parser", () => {
  test("simple", () => {
    expect(testParse("test")).toMatchObject(
      err({ message: "Parsing failed on line 1 :\nInvalid URL : test" }),
    );
    expect(testParse("https://soleuniverse.me\n  @inline, test\n   template")).toMatchObject(
      err({
        message:
          "Parsing failed on line 2 :\nInline block cannot contain a template",
      }),
    );

    expect(testParse("https://soleuniverse.me")).toMatchObject(
      ok([
        {
          content: "https://soleuniverse.me",
          astNode: {
            type: "root",
            url: new URL("https://soleuniverse.me"),
          },
        },
      ]),
    );

    expect(
      testParse(`https://soleuniverse.me
  h1
  +, ul
    @inline, li.class`),
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
              },
            },
            {
              content: "+, ul",
              astNode: {
                type: "block",
                selector: "ul",
                quantifier: "+",
              },
              children: [
                {
                  content: "@inline, li.class",
                  astNode: {
                    type: "block",
                    selector: "li.class",
                    modes: { inline: true },
                  },
                },
              ],
            },
          ],
        },
      ]),
    );
  });
});
