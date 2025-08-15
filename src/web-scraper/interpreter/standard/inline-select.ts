import { ok } from "neverthrow";
import { wrapValue } from "../../data";
import { createFunctionWithOptions } from "../../data/functions";
import { sysCall } from "../../data/system-calls";
import { selectElements } from "./select";

export const inlineSelect = createFunctionWithOptions(
  ["String"],
  ["Number"],
  "SystemCall",
  async ([selector], [count], env, _sourceContext) =>
    ok(
      sysCall("generateContext", {
        contexts: selectElements(env, selector, count).map((element) => {
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
