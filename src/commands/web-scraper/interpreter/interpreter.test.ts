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

  test("nesting", async () => {
    expect(
      await testInterpret(
        `https://en.wikipedia.org/wiki/The_Pet_Girl_of_Sakurasou
  @inline, dl:nth-of-type(6)
    dt
    dt span[lang="ja"]`,
      ),
    ).toMatchObject(
      ok([
        {
          content: "The Pet Girl of Sakurasou - Wikipedia",
          children: [
            { content: "Ryūnosuke Akasaka" },
            { content: "赤坂 龍之介" },
          ],
        },
      ]),
    );
  });
});
