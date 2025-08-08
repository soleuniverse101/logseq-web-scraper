import { Err } from "neverthrow";
import { ParserError } from "../web-scraper/errors/parser-errors";
import { RuntimeError } from "../web-scraper/errors/interpreter-errors";

export async function reportIssue(error: Error) {
  await logseq.UI.showMsg(error.message, "error");

  if (error instanceof ParserError) {
    await logseq.Editor.editBlock(error.context.blockUUID, {
      pos: error.context.column,
    });
  } else if (error instanceof RuntimeError) {
    await logseq.Editor.selectBlock(error.context.blockUUID);
  }
}

export async function reportIssues(errors: Err<unknown, Error | Error[]>) {
  if (Array.isArray(errors.error)) {
    for (const err of errors.error) {
      await reportIssue(err);
    }
  } else {
    await reportIssue(errors.error);
  }
}
