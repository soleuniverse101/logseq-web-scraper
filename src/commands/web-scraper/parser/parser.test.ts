import { describe, expect, test } from "vitest";
import { Parser } from ".";
import { parseTestBlock } from "../test";

describe("Parser", () => {
  test("simple", () => {
    expect(
      Parser.parse(parseTestBlock("test"))._unsafeUnwrapErr(),
    ).toMatchObject({ message: "Parsing failed on line 1 :\nInvalid URL" });
  });
});
