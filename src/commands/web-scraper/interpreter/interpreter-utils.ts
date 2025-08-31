import { ok, ResultAsync } from "neverthrow";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr } from "../errors/runtime-errors";
import { RuntimeResult } from ".";

const domParser = new DOMParser();

export async function fetchPage(
  url: URL,
  sourceContext: SourceLineContext,
): RuntimeResult<HTMLDocument> {
  const response = await ResultAsync.fromPromise(
    fetch(url, {
      method: "GET",
      headers: { Accept: "text/html; charset=utf-8" },
    }),
    (_err) => runtimeErr("fetchIssue", { url: url.toString() }, sourceContext),
  );
  if (response.isErr()) {
    return response.error;
  }

  if (response.value.status != 200) {
    return runtimeErr(
      "fetchIssue",
      {
        url: url.toString(),
        details: `${response.value.status.toString()} ${response.value.statusText}`,
      },
      sourceContext,
    );
  }

  const text = await ResultAsync.fromPromise(response.value.text(), (_error) =>
    runtimeErr("fetchIssue", { url: url.toString() }, sourceContext),
  );
  if (text.isErr()) {
    return text.error;
  }

  return ok(domParser.parseFromString(text.value, "text/html"));
}
