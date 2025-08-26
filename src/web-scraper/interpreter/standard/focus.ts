import { ok } from "neverthrow";
import { wrapValue } from "../../data";
import { createFunction } from "../../data/functions";
import { sysCall } from "../../data/system-calls";

export const impureInlineFocus = createFunction(
  ["HtmlElement"],
  "SystemCall",
  async ([element], _env, _sourceContext) => {
    const value = wrapValue("HtmlElement", element);
    return ok(
      sysCall("generateContext", {
        context: {
          prepareEnv: (env) =>
            env.setRootElement(
              "currentElement",
              wrapValue("HtmlElement", element),
            ),
          value,
        },
      }),
    );
  },
);
