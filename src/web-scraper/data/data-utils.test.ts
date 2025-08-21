import { expect, test } from "vitest";
import { Value } from ".";
import { unwrapTypedArray } from "./functions/inputs";
import { err, ok } from "neverthrow";

test("unwrapTypedArray", () => {
  expect(
    unwrapTypedArray(
      {
        type: "Array",
        value: [
          { type: "String", value: "a" },
          { type: "String", value: "b" },
          { type: "String", value: "c" },
        ],
      } satisfies Value,
      ["String"],
    ),
  ).toEqual(ok(["a", "b", "c"]));

  expect(
    unwrapTypedArray(
      {
        type: "Array",
        value: [{ type: "Array", value: [] }],
      } satisfies Value,
      ["Array"],
    ),
  ).toEqual(ok([[]]));

  expect(
    unwrapTypedArray(
      {
        type: "Array",
        value: [
          {
            type: "Array",
            value: [
              { type: "Number", value: 5 },
              { type: "Number", value: 6 },
            ],
          },
          { type: "Array", value: [{ type: "Number", value: 0 }] },
        ],
      } satisfies Value,
      [["Number"]],
    ),
  ).toEqual(ok([[5, 6], [0]]));

  expect(
    unwrapTypedArray(
      {
        type: "Array",
        value: [
          {
            type: "Array",
            value: [
              { type: "Number", value: 5 },
              { type: "String", value: "Test" },
            ],
          },
          { type: "Array", value: [{ type: "Number", value: 0 }] },
        ],
      } satisfies Value,
      [["Number"]],
    ),
  ).toEqual(err());
});
