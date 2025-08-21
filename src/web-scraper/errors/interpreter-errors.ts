import { err } from "neverthrow";
import { ValueType } from "../data";
import { Operation } from "../interpreter/operations";
import { SourceLineContext } from "./parser-errors";
import { Input } from "../data/functions";

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
  wrongArgumentsCount: (
    info: {
      actualCount: number;
    } & (
      | { type: "precise"; expectedCount: number }
      | { type: "interval"; minCount: number; maxCount: number }
    ),
  ) =>
    `Function expected ${info.type == "precise" ? info.expectedCount : `between ${info.minCount} and ${info.maxCount}`} argument(s) but ${info.actualCount} were passed`,
  wrongArgumentsTypes: ({
    expectedTypes,
    expectedOptionalTypes,
    actualTypes,
  }: {
    expectedTypes: Input[];
    expectedOptionalTypes: Input[];
    actualTypes: ValueType[];
  }) =>
    `Function expected arguments of types [${expectedTypes
      .map((type) => type.toString())
      .concat(
        expectedOptionalTypes
          .map((type) => type.toString())
          .map((type) => `(${type})`),
      )
      .join(
        ", ",
      )}] but arguments of types [${actualTypes.join(", ")}] were passed`,
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
  noSelectorSpecified: () => "At least one selector must be specified",
  nonArrayIndexed: () => "Cannot index values that are not arrays",
  nonNumberIndex: ({ type }: { type: ValueType }) =>
    `Array index provided should be a number, instead it was ${type}`,
  indexOutOfBounds: ({
    index,
    arrayLength,
  }: {
    index: number;
    arrayLength: number;
  }) =>
    `Cannot get element of (zero-based) index ${index} from array of ${arrayLength} element(s)`,
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
