import { BlockUUID } from "@logseq/libs/dist/LSPlugin.user";
import { err } from "neverthrow";
import { MatchResult } from "ohm-js";

export type SourceLineContext = {
  blockUUID: BlockUUID;
  blockLine: number;
};

export type SourceContext = SourceLineContext & {
  column: number;
};

export class ParserError extends Error {
  readonly context: SourceContext;
  constructor(message: string, context: SourceContext) {
    super(message);
    this.context = context;
  }
}

export function astParsingErr(error: AstError, context: SourceLineContext) {
  return err(
    new ParserError(
      `Parsing failed on line ${context.blockLine} :\n${error.message}`,
      { column: error.column, ...context },
    ),
  );
}

export class AstError extends Error {
  readonly column: number;
  constructor(message: string, column: number) {
    super(message);
    this.column = column;
  }
}

export function astErr(match: MatchResult) {
  return err(
    new AstError(
      match.shortMessage?.replace(/Line \d+, col \d+: /, "") ??
        "Parsing failed",
      match.getInterval().startIdx,
    ),
  );
}
