import { ok } from "neverthrow";
import { Value, ValueFromType } from "../data";
import { RuntimeResult } from "../interpreter";
import { runtimeErr } from "./interpreter-errors";

export type ElementInputs = Pick<HTMLElement, "textContent"> & {
  pageTitle: string;
  pageURL: string;
};

const reservedVariables: string[] = [
  "_",
  "fetch",
] satisfies (keyof ReservedVariables)[];
type ReservedVariables = { _: HTMLDocument; fetch: null };

export class Environment {
  private variables: Map<String, Value> = new Map();
  private parent: Environment | null = null;

  public define(name: string, value: Value): RuntimeResult<void> {
    if (reservedVariables.includes(name)) {
      runtimeErr("reservedIdentifier", { name });
    }
    this.variables.set(name, value);
    return ok();
  }

  public assignRoot(root: ValueFromType<"HtmlDocument">) {
    this.variables.set("_", root);
  }

  public get(name: string): RuntimeResult {
    let env: Environment | null = this;

    while (env) {
      const value = env.get(name);
      if (value != null) {
        return value;
      }
      env = env.parent;
    }

    return runtimeErr("IdentifierNotFound", { name });
  }

  public extendScope() {
    let env = new Environment();
    env.parent = this;
    return env;
  }
}
