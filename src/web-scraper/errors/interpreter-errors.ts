import { err } from "neverthrow";
import { ValueType } from "../data";
import { Operation } from "../parser/ast";
import { SourceLineContext } from "./parser-errors";

export class RuntimeError extends Error {
  readonly context: SourceLineContext;
  constructor(message: string, context: SourceLineContext) {
    super(`${message} (line ${context.blockLine})`);
    this.context = context;
  }
}

const errorMessages = {
  unknownIdentifier: ({ name }: { name: string }) =>
    "Unknown identifier : " + name,
  unsupportedOperation: ({
    operation,
    types,
  }: {
    operation: Operation;
    types: ValueType[];
  }) =>
    `Unsupported operation '${operation}' applied on type(s) ${types.join(", ")}`,
  reservedIdentifier: ({ name }: { name: string }) =>
    `Identifier '${name}' is reserved`,
  IdentifierNotFound: ({ name }: { name: string }) =>
    `Identifier '${name}' not found, make sure it's defined`,
} as const satisfies Record<string, (info: any) => string>;

export function runtimeErr<Type extends keyof typeof errorMessages>(
  type: Type,
  info: Parameters<(typeof errorMessages)[Type]>[0],
  context: SourceLineContext,
) {
  return err(new RuntimeError(errorMessages[type](info as any), context));
}
