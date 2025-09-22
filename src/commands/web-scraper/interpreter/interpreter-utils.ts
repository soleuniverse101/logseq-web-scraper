import { ok, ResultAsync } from "neverthrow";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr } from "../errors/runtime-errors";
import { RuntimeResult } from ".";
import { OutputNode } from "./output";
import { BlockUUID } from "@logseq/libs/dist/LSPlugin.user";

export type FetchPage = typeof defaultFetchPage;

export async function defaultFetchPage(
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

  return ok(Document.parseHTMLUnsafe(text.value));
}

export function elementText(element: HTMLElement): string {
  return Array.from(element.childNodes)
    .reduce((a, b) => a + (b.nodeType === 3 ? b.textContent : ""), "")
    .trim();
}

export function zipByUUID(nodes: OutputNode[]): OutputNode[][] {
  if (nodes.length == 0) {
    return [];
  }

  const ids: BlockUUID[] = [];
  const groups: Record<BlockUUID, OutputNode[]> = {};

  for (const node of nodes) {
    const id = node.context.blockUUID;
    if (!(id in groups)) {
      ids.push(id);
      groups[id] = [];
    }
    const group = groups[id];
    group.push(node);
  }

  let minLength = +Infinity;
  for (const id of ids) {
    minLength = Math.min(minLength, groups[id].length);
  }

  const zipped: OutputNode[][] = [];
  for (let i = 0; i < minLength; i++) {
    const group: OutputNode[] = [];
    for (const id of ids) {
      group.push(groups[id][i]);
    }
    zipped.push(group);
  }

  return zipped;
}
