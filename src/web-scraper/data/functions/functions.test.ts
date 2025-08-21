import { describe, expect, test } from "vitest";
import { createFunction, createFunctionWithOptions } from ".";
import { ok } from "neverthrow";
import { wrapArray, wrapValue } from "..";
import { Environment } from "../../interpreter/environment";
import { typedArray } from "./inputs";
import { runtimeErr } from "../../errors/interpreter-errors";

describe("createFunctions", () => {
  const context = {
    blockLine: 1,
    blockUUID: "uuid",
  } as const;

  test("simple", async () => {
    const f = createFunction(["Number"], "String", async ([n]) =>
      ok(n.toString()),
    );

    expect(f.inputTypes).toEqual(["Number"]);
    expect(f.outputType).toEqual("String");
    expect(f.optionalInputTypes).toEqual([]);
    expect(
      await f.map([wrapValue("Number", 5)], new Environment(), {
        blockLine: 1,
        blockUUID: "uuid",
      }),
    ).toEqual(ok(wrapValue("String", "5")));
  });

  test("typed (simple)", async () => {
    const f = createFunction([typedArray(["Number"])], "String", async ([n]) =>
      ok(n.toString()),
    );

    expect(f.inputTypes).toEqual(["Array"]);
    expect(f.outputType).toEqual("String");
    expect(f.optionalInputTypes).toEqual([]);
    expect(
      await f.map(
        [wrapArray(wrapValue("Number", 5))],
        new Environment(),
        context,
      ),
    ).toEqual(ok(wrapValue("String", "5")));
  });

  test("typed (nested)", async () => {
    const f1 = createFunction(
      [typedArray([["String"]])],
      "Number",
      async ([arr]) => {
        let count = 0;
        for (const strings of arr) {
          for (const _ of strings) {
            count++;
          }
        }
        return ok(count);
      },
    );

    expect(f1.inputTypes).toEqual(["Array"]);
    expect(f1.outputType).toEqual("Number");
    expect(f1.optionalInputTypes).toEqual([]);
    expect(
      await f1.map(
        [
          wrapArray(
            wrapArray(
              wrapValue("String", "test"),
              wrapValue("String", "test1"),
            ),
            wrapArray(wrapValue("String", "test2")),
          ),
        ],
        new Environment(),
        {
          blockLine: 1,
          blockUUID: "uuid",
        },
      ),
    ).toEqual(ok(wrapValue("Number", 3)));

    const f2 = createFunction(
      [typedArray([[["Number"]]])],
      "Number",
      async ([arr]) => {
        let sum = 0;
        arr.forEach((arr) =>
          arr.forEach((arr) => arr.forEach((n) => (sum += n))),
        );
        return ok(sum);
      },
    );

    expect(f2.inputTypes).toEqual(["Array"]);
    expect(f2.outputType).toEqual("Number");
    expect(f2.optionalInputTypes).toEqual([]);
    // Fail
    expect(
      await f2.map([wrapArray(wrapValue("Number", 5))], new Environment(), {
        blockLine: 1,
        blockUUID: "uuid",
      }),
    ).toEqual(
      runtimeErr(
        "wrongArgumentsTypes",
        {
          expectedTypes: [typedArray([[["Number"]]])],
          actualTypes: ["Array"],
          expectedOptionalTypes: [],
        },
        context,
      ),
    );
    expect(
      await f2.map(
        [wrapArray(wrapArray(wrapArray(wrapValue("Number", 5))))],
        new Environment(),
        {
          blockLine: 1,
          blockUUID: "uuid",
        },
      ),
    ).toEqual(ok(wrapValue("Number", 5)));
    // Fail
    expect(
      await f2.map(
        [
          wrapArray(
            wrapArray(
              wrapArray(wrapValue("Number", 5), wrapValue("String", "test")),
            ),
          ),
        ],
        new Environment(),
        {
          blockLine: 1,
          blockUUID: "uuid",
        },
      ),
    ).toEqual(
      runtimeErr(
        "wrongArgumentsTypes",
        {
          expectedTypes: [typedArray([[["Number"]]])],
          actualTypes: ["Array"],
          expectedOptionalTypes: [],
        },
        context,
      ),
    );
  });
});

describe("createFunctionsWithOptions", () => {
  test("without options", async () => {
    const f = createFunctionWithOptions(["Number"], [], "String", async ([n]) =>
      ok(n.toString()),
    );

    expect(f.inputTypes).toEqual(["Number"]);
    expect(f.optionalInputTypes).toEqual([]);
    expect(f.outputType).toEqual("String");
    expect(
      await f.map([wrapValue("Number", 5)], new Environment(), {
        blockLine: 1,
        blockUUID: "uuid",
      }),
    ).toEqual(ok(wrapValue("String", "5")));
    expect(
      await f.map([wrapValue("Number", 5)], new Environment(), {
        blockLine: 1,
        blockUUID: "uuid",
      }),
    ).toEqual(ok(wrapValue("String", "5")));
  });

  test("with options", async () => {
    const f = createFunctionWithOptions(
      ["Number"],
      ["Number"],
      "String",
      async ([n], [factor]) => ok((factor ? n * factor : n).toString()),
    );

    expect(f.inputTypes).toEqual(["Number"]);
    expect(f.optionalInputTypes).toEqual(["Number"]);
    expect(f.outputType).toEqual("String");
    expect(
      await f.map(
        [wrapValue("Number", 5), wrapValue("Number", 5)],
        new Environment(),
        {
          blockLine: 1,
          blockUUID: "uuid",
        },
      ),
    ).toEqual(ok(wrapValue("String", "25")));
  });
});
