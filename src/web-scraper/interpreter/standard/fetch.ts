import { ok, ResultAsync } from "neverthrow";
import { wrapValue } from "../../data";
import { createFunction } from "../../data/functions";
import { runtimeErr } from "../../errors/interpreter-errors";
import { SourceLineContext } from "../../errors/parser-errors";
import { Environment } from "../environment";

const domParser = new DOMParser();

const map = async (
  [_url]: [string],
  _env: Environment,
  sourceContext: SourceLineContext,
) => {
  let url;
  try {
    url = new URL(_url);
  } catch {
    return runtimeErr("invalidUrl", { url: _url }, sourceContext);
  }

  const response = await ResultAsync.fromPromise(
    fetch(url, {
      method: "GET",
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }),
    (_error) => runtimeErr("fetchIssue", { url: _url }, sourceContext),
  );
  if (response.isErr()) {
    return response.error;
  }

  if (response.value.status != 200) {
    return runtimeErr(
      "fetchIssue",
      {
        url: _url,
        details: `${response.value.status.toString()} ${response.value.statusText}`,
      },
      sourceContext,
    );
  }

  const text = await ResultAsync.fromPromise(response.value.text(), (_error) =>
    runtimeErr("fetchIssue", { url: _url }, sourceContext),
  );
  if (text.isErr()) {
    return text.error;
  }

  return ok(domParser.parseFromString(text.value, "text/html"));
};

export const pureFetch = createFunction(["String"], "HtmlDocument", map);
export const impureFetch = createFunction(
  ["String"],
  "HtmlDocument",
  async (inputs, env, sourceContext) => {
    const result = await map(inputs, env, sourceContext);
    if (result.isErr()) {
      return result;
    }
    env.setRootElement("document", wrapValue("HtmlDocument", result.value));
    env.setRootElement(
      "currentElement",
      wrapValue("HtmlElement", result.value.body),
    );
    return ok(result.value);
  },
);
