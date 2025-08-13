import { ok } from "neverthrow";
import { wrapValue } from "../../data";
import { createFunction } from "../../data/functions";
import { sysCall } from "../../data/system";
import { Environment } from "../environment";

function selectElements(env: Environment, selector: string) {
  return Array.from(
    env
      .getRootElement("currentElement")
      .value.querySelectorAll(selector)
      .values(),
  );
}

export const pureSelectList = createFunction(
  ["String"],
  "Array",
  async ([selector], env, _sourceContext) =>
    ok(
      selectElements(env, selector).map((element) =>
        wrapValue("HtmlElement", element as HTMLElement),
      ),
    ),
);

export const impureSelectList = createFunction(
  ["String"],
  "SystemCall",
  async ([selector], env, _sourceContext) =>
    ok(
      sysCall("generateContext", {
        contexts: selectElements(env, selector).map((element) => {
          const elementValue = wrapValue("HtmlElement", element as HTMLElement);
          return {
            prepareEnv: (env) =>
              env.setRootElement("currentElement", elementValue),
            value: elementValue,
          };
        }),
      }),
    ),
);
