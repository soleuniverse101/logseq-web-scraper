import { err } from "neverthrow";
import { SourceLineContext } from "./parser-errors";

export type RuntimeContext = SourceLineContext;

export class RuntimeError extends Error {
  readonly context?: RuntimeContext;
  constructor(message: string, context?: RuntimeContext) {
    super(message + (context ? ` (line ${context.blockLine})` : ""));
    this.context = context;
  }

  public static withContext(error: RuntimeError, context: RuntimeContext) {
    return new RuntimeError(error.message, context);
  }
}

const errorMessages = {
  reservedIdentifier: ({ name }: { name: string }) =>
    `Identifier '${name}' is reserved`,
  identifierNotFound: ({ name }: { name: string }) =>
    `Identifier '${name}' not found, make sure it's defined`,
  invalidUrl: ({ url }: { url: string }) =>
    `URL '${url}' is invalid. It should be fully qualified`,
  fetchIssue: ({ url, details }: { url: string; details?: string }) =>
    `Failed fetching '${url}'` + (details ? ` (${details})` : ""),
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
  context: RuntimeContext,
) {
  return err(new RuntimeError(errorMessages[type](info as any), context));
}
