import { ok } from "neverthrow";
import { createFunctionWithOptions } from "../../data/functions";
import { typedArray } from "../../data/functions/inputs";
import { runtimeErr } from "../../errors/interpreter-errors";
import { zip } from "../../scraper-utils";
import { selectElements } from "./select";
import { wrapArray, wrapValue } from "../../data";

export const selectSiblings = createFunctionWithOptions(
  [typedArray(["String"])],
  ["Number"],
  "Array",
  async ([selectors], [count], env, sourceContext) => {
    if (selectors.length == 0) {
      return runtimeErr("noSelectorSpecified", undefined, sourceContext);
    }

    return ok(
      zip(
        ...selectors.map((selector) =>
          selectElements(env, `:scope > ${selector}`, count),
        ),
      )
        .map((elements) =>
          elements.map((element) => wrapValue("HtmlElement", element)),
        )
        .map((elements) => wrapArray(...elements)),
    );
  },
);
