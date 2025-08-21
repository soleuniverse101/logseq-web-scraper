import { ok } from "neverthrow";
import { wrapArray, wrapValue } from "../../data";
import { createFunctionWithOptions } from "../../data/functions";
import { typedArray } from "../../data/functions/inputs";
import { runtimeErr } from "../../errors/interpreter-errors";
import { zip } from "../../scraper-utils";
import { selectElements } from "./select";
import { sysCall } from "../../data/system-calls";

export const impureInlineSelectSiblings = createFunctionWithOptions(
  [typedArray(["String"])],
  ["Number"],
  "SystemCall",
  async ([selectors], [count], env, sourceContext) => {
    if (selectors.length == 0) {
      return runtimeErr("noSelectorSpecified", undefined, sourceContext);
    }

    const siblings = zip(
      ...selectors.map((selector) =>
        selectElements(env, `:scope > ${selector}`, count),
      ),
    )
      .map((elements) =>
        elements.map((element) => wrapValue("HtmlElement", element)),
      )
      .map((elements) => wrapArray(...elements));

    return ok(
      sysCall("generateContext", {
        contexts: siblings.map((siblings) => ({
          prepareEnv: (env) => env.setRootElement("siblings", siblings),
          value: siblings,
        })),
      }),
    );
  },
);
