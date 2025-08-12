import { Err } from "neverthrow";
import { RuntimeError } from "./interpreter-errors";
import { ParserError } from "./parser-errors";
import { reportIssue } from "../../errors/report";

export async function reportError(error: Error) {
  await reportIssue(error.message);
  if (error instanceof ParserError) {
    await logseq.Editor.editBlock(error.context.blockUUID, {
      pos: error.context.column,
    });
  } else if (error instanceof RuntimeError && error.context) {
    await logseq.Editor.selectBlock(error.context.blockUUID);
  }
}

export async function reportErrors(errors: Err<unknown, Error | Error[]>) {
  if (Array.isArray(errors.error)) {
    for (const err of errors.error) {
      await reportError(err);
    }
  } else {
    await reportError(errors.error);
  }
}
