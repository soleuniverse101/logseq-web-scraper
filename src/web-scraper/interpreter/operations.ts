import { ok } from "neverthrow";
import { RuntimeResult } from ".";
import { Value, wrapValue } from "../data";
import { convert } from "../data/conversions";
import { Operation } from "../parser/ast";
import { runtimeErr } from "../errors/interpreter-errors";

export function applyOperation(
  operation: Operation,
  left: Value,
  right: Value,
): RuntimeResult {
  if (left.type == "String" && operation == "+") {
    return ok(wrapValue("String", left.value + convert(right, "String").value));
  } else if (left.type == "Number" && right.type == "Number") {
    return ok(
      wrapValue("Number", operationsMap[operation](left.value, right.value)),
    );
  }
  return runtimeErr("unsupportedOperation", {
    operation,
    types: [left.type, right.type],
  });
}

const operationsMap = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
} as const satisfies Record<Operation, (a: number, b: number) => number>;
