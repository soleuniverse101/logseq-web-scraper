import { ok } from "neverthrow";
import { describe, expect, test } from "vitest";
import { testInterpret } from "../test/test-utils";

describe("interpreter (full integration)", () => {
  test("simple fetch + block", async () => {
    expect(
      await testInterpret(
        "https://mrrobot.fandom.com/wiki/Mr._Robot\n  .mw-page-title-main",
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
