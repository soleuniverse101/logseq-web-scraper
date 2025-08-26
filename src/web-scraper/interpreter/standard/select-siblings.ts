import { ok } from "neverthrow";
import { ValuesArray, wrapArray, wrapObject, wrapValue } from "../../data";
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

    const siblingsMap = new Map<string, ValuesArray<"HtmlElement">>();
    const siblings = zip(
      ...selectors.map((selector) =>
        selectElements(env, `:scope > ${selector}`, count),
      ),
    )
      .map((elements) =>
        elements.map((element) => {
          const value = wrapValue("HtmlElement", element);
          const tagName = element.tagName.toLowerCase();
          if (!siblingsMap.has(tagName)) {
            siblingsMap.set(tagName, wrapArray(value));
          } else {
            siblingsMap.get(tagName)!.value.push(value);
          }
          return value;
        }),
      )
      .map((elements) => wrapArray(...elements));

    return ok(
      sysCall("generateContexts", {
        contexts: siblings.map((siblings) => ({
          prepareEnv: (env) => {
            env.setRootElement("siblings", siblings);
            env.setRootElement("siblingsMap", wrapObject(siblingsMap));
          },
          value: siblings,
        })),
      }),
    );
  },
);
