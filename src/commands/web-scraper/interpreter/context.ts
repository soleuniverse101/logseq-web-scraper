import { RuntimeResult } from ".";
import { ValueFromType } from "../data";
import { Environment } from "./environment";

export type Context = {
  /**
   * Call to execute a context. This needs to be called after the prepare function
   * @returns Either a String Value if the context returns a block or null if it's void
   */
  execute: (env: Environment) => RuntimeResult<string | void>;
};
export type Contexts = Context[];

export function context(
  execute: (env: Environment) => RuntimeResult<string | void>,
): ValueFromType<"Contexts"> {
  return { type: "Contexts", value: [{ execute }] };
}
export function emptyContext(): ValueFromType<"Contexts"> {
  return contexts();
}

export function contexts(
  ...contexts: {
    execute: (env: Environment) => RuntimeResult<string | void>;
  }[]
): ValueFromType<"Contexts"> {
  return { type: "Contexts", value: contexts };
}
