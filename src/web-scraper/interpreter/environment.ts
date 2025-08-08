import { ok } from "neverthrow";
import { RuntimeResult } from ".";
import { Value, ValueFromType } from "../data";
import { runtimeErr } from "../errors/interpreter-errors";
import { SourceLineContext } from "../errors/parser-errors";

export type ElementInputs = Pick<HTMLElement, "textContent"> & {
  pageTitle: string;
  pageURL: string;
};

type ReservedVariables = { _: HTMLDocument };
const reservedVariables: string[] = ["_"] satisfies (keyof ReservedVariables)[];

export class Environment {
  private readonly variables: Map<String, Value> = new Map();
  private parent: Environment | null = null;

  public define(
    name: string,
    value: Value,
    sourceContext: SourceLineContext,
  ): RuntimeResult<void> {
    if (reservedVariables.includes(name)) {
      runtimeErr("reservedIdentifier", { name }, sourceContext);
    }
    this.variables.set(name, value);
    return ok();
  }

  public assignRoot(root: ValueFromType<"HtmlDocument">) {
    this.variables.set("_", root);
  }

  public get(name: string, sourceContext: SourceLineContext): RuntimeResult {
    let env: Environment | null = this;

    while (env) {
      const value = env.variables.get(name);
      if (value != null) {
        return ok(value);
      }
      env = env.parent;
    }

    return runtimeErr("IdentifierNotFound", { name }, sourceContext);
  }

  public extendScope() {
    let env = new Environment();
    env.parent = this;
    return env;
  }

  public outScope() {
    if (this.parent) {
      return this.parent;
    }
    throw new Error("Cannot leave the root scope");
  }
}
