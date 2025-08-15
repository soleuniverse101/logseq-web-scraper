import { ok } from "neverthrow";
import { wrapValue } from "../../data";
import { createFunctionWithOptions } from "../../data/functions";
import { Environment } from "../environment";

export function selectElements(
  env: Environment,
  selector: string,
  maxCount?: number,
) {
  return Array.from(
    env.getRootElement("currentElement").value.querySelectorAll(selector),
  ).slice(0, maxCount);
}

export const select = createFunctionWithOptions(
  ["String"],
  ["Number"],
  "Array",
  async ([selector], [count], env, _sourceContext) =>
    ok(
      selectElements(env, selector, count).map((element) =>
        wrapValue("HtmlElement", element as HTMLElement),
      ),
    ),
);
