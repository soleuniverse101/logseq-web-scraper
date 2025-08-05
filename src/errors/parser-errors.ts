import { err } from "neverthrow";

export class ParserError extends Error {
  readonly blockLine: number;
  readonly column?: number;
  constructor(message: string, blockLine: number, column?: number) {
    super(message);
    this.blockLine = blockLine;
    this.column = column;
  }
}

const parserErrors = {} as const;

type ParserErrorType = keyof typeof parserErrors;

export function parserErr(
  type: ParserErrorType,
  blockLine: number,
  column?: number,
) {
  return err(new ParserError(parserErrors[type], blockLine, column));
}

export function exprParserErr(blockLine: number, error: ExprError) {
  return err(
    new ParserError(
      `Failed parsing line ${blockLine} : ${error.message}`,
      blockLine,
      error.column,
    ),
  );
}

export class ExprError extends Error {
  readonly column?: number;
  constructor(message: string, column?: number) {
    super(message);
    this.column = column;
  }
}

const exprErrors = {
  invalidUrl:
    "An invalid URL was provided. Note that protocol (http(s)://) must be specified.",
} as const;

type ExprErrorType = keyof typeof exprErrors;

export function exprErr(type: ExprErrorType, column?: number) {
  return err(new ExprError(exprErrors[type], column));
}
