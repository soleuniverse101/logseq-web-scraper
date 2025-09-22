import { ok } from "neverthrow";
import { describe, expect, test } from "vitest";
import { testInterpret } from "../test/test-utils";

describe("interpreter (full integration)", () => {
  test("simple fetch", async () => {
    expect(
      await testInterpret("https://test.test/Dexter_(TV_series)"),
    ).toMatchObject(
      ok([
        {
          content: "Dexter (TV series) - Wikipedia",
        },
      ]),
    );
  });

  test("simple fetch + block", async () => {
    expect(
      await testInterpret("https://test.test/Mr._Robot\n  .mw-page-title-main"),
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
        `https://test.test/The_Pet_Girl_of_Sakurasou
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

  test("templates", async () => {
    expect(
      await testInterpret(
        `https://test.test/I_Made_Friends_with_the_Second_Prettiest_Girl_in_My_Class
 Title is '{}'
  dt:nth-of-type(2)
   Best girl is {}`,
      ),
    ).toMatchObject(
      ok([
        {
          content:
            "Title is 'I Made Friends with the Second Prettiest Girl in My Class - Wikipedia'",
          children: [{ content: "Best girl is Umi Asanagi" }],
        },
      ]),
    );

    expect(
      await testInterpret(
        `https://test.test/Fumiya_Tomozaki
  [title="Atafami"]
   [{}]({fullHref})`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [
            {
              content: "[Attack Families](https://test.test/wiki/Atafami)",
            },
          ],
        },
      ]),
    );
  });

  test("quantifiers", async () => {
    expect(
      await testInterpret(
        `https://fr.wikipedia.org/wiki/Dr._Stone
  @inline, #mw-content-text > div.mw-content-ltr.mw-parser-output > table:nth-child(70) > tbody > tr:nth-child(1)
    +, th`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [
            {
              content: "Début",
            },
            {
              content: "Fin\n",
            },
          ],
        },
      ]),
    );

    expect(
      await testInterpret(
        `https://jaku-chara-tomozaki-kun.fandom.com/wiki/Fumiya_Tomozaki
  [title="Atafami"]
   [{}]({fullHref})`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [
            {
              content:
                "[Attack Families](https://jaku-chara-tomozaki-kun.fandom.com/wiki/Atafami)",
            },
          ],
        },
      ]),
    );
  });
});
