import { err } from "neverthrow";
import { ValueType } from "../data";
import { SourceLineContext } from "./parser-errors";
import { Operation } from "../interpreter/operations";

export class RuntimeError extends Error {
  readonly context?: SourceLineContext;
  constructor(message: string, context?: SourceLineContext) {
    super(message + (context ? ` (line ${context!.blockLine})` : ""));
    this.context = context;
  }

  public static withContext(error: RuntimeError, context: SourceLineContext) {
    return new RuntimeError(error.message, context);
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
  unsupportedConvert: ({ from, to }: { from: ValueType; to: ValueType }) =>
    `Cannot convert type '${from}' to ${to}`,
  reservedIdentifier: ({ name }: { name: string }) =>
    `Identifier '${name}' is reserved`,
  IdentifierNotFound: ({ name }: { name: string }) =>
    `Identifier '${name}' not found, make sure it's defined`,
  valueNotCallable: ({ type }: { type: ValueType }) =>
    `Value of type '${type}' is not callable`,
  wrongArgumentsCount: ({
    expectedCount,
    actualCount,
  }: {
    expectedCount: number;
    actualCount: number;
  }) =>
    `Function expected ${expectedCount} argument(s) but ${actualCount} were passed`,
  wrongArgumentsTypes: ({
    expectedTypes,
    actualTypes,
  }: {
    expectedTypes: ValueType[];
    actualTypes: ValueType[];
  }) =>
    `Function expected arguments of types [${expectedTypes.join(",")}] but ${actualTypes.join(",")} were passed`,
  invalidUrl: ({ url }: { url: string }) =>
    `URL '${url}' is invalid. It should be fully qualified`,
  fetchIssue: ({ url, details }: { url: string; details?: string }) =>
    `Failed fetching '${url}'` + details ? `(${details})` : "",
  usedObjectProperty: ({ key }: { key: string }) =>
    `Object property with name '${key}' already assigned`,
  propertyAccessOnNonObject: ({}) =>
    `Cannot access properties on values that are not objects`,
  undefinedObjectProperty: ({ property }: { property: string }) =>
    `Accessed object property '${property}' is undefined`,
  selectElementNotFound: ({ selector }: { selector: string }) =>
    `No match found for selector ${selector}`,
} as const satisfies Record<string, (info: any) => string>;

export function contextlessRuntimeErr<Type extends keyof typeof errorMessages>(
  type: Type,
  info: Parameters<(typeof errorMessages)[Type]>[0],
) {
  return err(new RuntimeError(errorMessages[type](info as any)));
}

export function runtimeErr<Type extends keyof typeof errorMessages>(
  type: Type,
  info: Parameters<(typeof errorMessages)[Type]>[0],
  context: SourceLineContext,
) {
  return err(new RuntimeError(errorMessages[type](info as any), context));
}
