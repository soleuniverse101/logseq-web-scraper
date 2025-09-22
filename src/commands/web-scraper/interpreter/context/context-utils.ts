import { Result } from "neverthrow";
import { Context } from ".";

export function context(
  execute: Context["execute"],
  prepare?: Context["prepare"],
): Context {
  return { execute, prepare };
}

export function withPrepare(
  context: Context,
  prepare: NonNullable<Context["prepare"]>,
): Context {
  return {
    prepare: context.prepare
      ? async (env) =>
          Result.combine([await prepare(env), await context.prepare!(env)]).map(
            () => {},
          )
      : prepare,
    execute: context.execute,
  };
}
