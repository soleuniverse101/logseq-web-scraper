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

  test("modes", async () => {
    expect(
      await testInterpret(
        `https://fr.wikipedia.org/Dr._Stone
  @inline, #inline-test
    p`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [
            {
              content: "Direct child",
            },
          ],
        },
      ]),
    );

    expect(
      await testInterpret(
        `https://test.test/Fumiya_Tomozaki
  @zip, div.zip
    +, p`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [
            {
              content: "Main div",
              children: [{ content: "Test1" }],
            },
            {
              content: "Main div",
              children: [{ content: "Test2" }],
            },
            {
              content: "Main div",
              children: [{ content: "Test3" }],
            },
          ],
        },
      ]),
    );

    expect(
      await testInterpret(
        `https://test.test/Fumiya_Tomozaki
  @inline @zip, div.zip
    +, p`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [
            {
              content: "Test1",
            },
            {
              content: "Test2",
            },
            {
              content: "Test3",
            },
          ],
        },
      ]),
    );

    expect(
      await testInterpret(
        `https://test.test/Fumiya_Tomozaki
  @zip, div#multiple-zip
   Group
    +, h2
    +, p`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [
            {
              content: "Group",
              children: [
                {
                  content: "Title1",
                },
                {
                  content: "Text1",
                },
              ],
            },
            {
              content: "Group",
              children: [
                {
                  content: "Title2",
                },
                {
                  content: "Text2",
                },
              ],
            },
          ],
        },
      ]),
    );
  });

  test("quantifiers", async () => {
    expect(
      await testInterpret(
        `https://test.test/Dr._Stone
  ?, p`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [
            {
              content: "Is there",
            },
          ],
        },
      ]),
    );
    expect(
      await testInterpret(
        `https://test.test/Dr._Stone
  ?, span`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [],
        },
      ]),
    );

    expect(
      await testInterpret(
        `https://test.test/Dr._Stone
  #mw-content-text > div.mw-content-ltr.mw-parser-output > table:nth-of-type(4) > tbody > tr:nth-child(1)
    +, th`,
      ),
    ).toMatchObject(
      ok([
        {
          children: [{ children: [{ content: "Début" }, { content: "Fin" }] }],
        },
      ]),
    );
  });
});
