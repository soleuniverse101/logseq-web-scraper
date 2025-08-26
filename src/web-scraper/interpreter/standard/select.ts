import { ok } from "neverthrow";
import { wrapValue } from "../../data";
import { createFunctionWithOptions } from "../../data/functions";
import { sysCall } from "../../data/system-calls";
import { Environment } from "../environment";

export function selectElements(
  env: Environment,
  selector: string,
  maxCount?: number,
): HTMLElement[] {
  return Array.from(
    env.getRootElement("currentElement").value.querySelectorAll(selector),
  ).slice(0, maxCount) as HTMLElement[];
}

export const select = createFunctionWithOptions(
  ["String"],
  ["Number"],
  "Array",
  async ([selector], [count], env, _sourceContext) =>
    ok(
      selectElements(env, selector, count).map((element) =>
        wrapValue("HtmlElement", element),
      ),
    ),
);

export const inlineSelect = createFunctionWithOptions(
  ["String"],
  ["Number"],
  "SystemCall",
  async ([selector], [count], env, _sourceContext) =>
    ok(
      sysCall("generateContexts", {
        contexts: selectElements(env, selector, count).map((element) => {
          const elementValue = wrapValue("HtmlElement", element);
          return {
            prepareEnv: (env) =>
              env.setRootElement("currentElement", elementValue),
            value: elementValue,
          };
        }),
      }),
    ),
);
