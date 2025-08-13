import { ok } from "neverthrow";
import { createFunction } from "../../data/functions";
import { runtimeErr } from "../../errors/interpreter-errors";
import { Environment } from "../environment";
import { SourceLineContext } from "../../errors/parser-errors";
import { wrapValue } from "../../data";

const map = async (
  [selector]: [string],
  env: Environment,
  sourceContext: SourceLineContext,
) => {
  const { value: current } = env.getRootElement("currentElement");
  const selection = current.querySelector(selector);

  if (!selection) {
    return runtimeErr("selectElementNotFound", { selector }, sourceContext);
  }

  return ok(selection as HTMLElement);
};

export const pureSelect = createFunction(["String"], "HtmlElement", map);
export const impureSelect = createFunction(
  ["String"],
  "HtmlElement",
  async ([selector], env, sourceContext) => {
    const result = await map([selector], env, sourceContext);
    if (result.isErr()) {
      return result;
    }

    env.setRootElement(
      "currentElement",
      wrapValue("HtmlElement", result.value),
    );

    return result;
  },
);
