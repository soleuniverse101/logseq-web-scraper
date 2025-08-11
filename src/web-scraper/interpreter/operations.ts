import { ok } from "neverthrow";
import { RuntimeResult } from ".";
import { Value, wrapValue } from "../data";
import { faillibleConvert } from "../data/conversions";
import { runtimeErr } from "../errors/interpreter-errors";
import { SourceLineContext } from "../errors/parser-errors";

export type Operation = "+" | "-" | "*" | "/";

export async function applyOperation(
  operation: Operation,
  left: Value,
  right: Value,
  sourceContext: SourceLineContext,
): RuntimeResult {
  if (left.type == "String" && operation == "+") {
    const rightString = await faillibleConvert(right, "String", sourceContext);
    if (rightString.isErr()) {
      return rightString;
    }
    return ok(wrapValue("String", left.value + rightString.value.value));
  } else if (left.type == "Number" && right.type == "Number") {
    return ok(
      wrapValue("Number", operationsMap[operation](left.value, right.value)),
    );
  }
  return runtimeErr(
    "unsupportedOperation",
    {
      operation,
      types: [left.type, right.type],
    },
    sourceContext,
  );
}

const operationsMap = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
} as const satisfies Record<Operation, (a: number, b: number) => number>;
