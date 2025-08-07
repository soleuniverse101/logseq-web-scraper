import { err } from "neverthrow";
import { MatchResult } from "ohm-js";

export class ExprError extends Error {
  readonly column?: number;
  constructor(message: string, column?: number) {
    super(message);
    this.column = column;
  }
}

export function exprErr(match: MatchResult) {
  return err(
    new ExprError(
      match.message ?? "Parsing failed",
      match.getInterval().startIdx,
    ),
  );
}
