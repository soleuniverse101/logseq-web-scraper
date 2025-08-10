import { ok } from "neverthrow";
import { RuntimeResult } from ".";
import { Value, ValueFromType } from "../data";
import { runtimeErr } from "../errors/interpreter-errors";
import { SourceLineContext } from "../errors/parser-errors";
import { reservedVariables } from "./standard/standard-variables";

export type ElementInputs = Pick<HTMLElement, "textContent"> & {
  pageTitle: string;
  pageURL: string;
};

export class Environment {
  private readonly variables: Map<String, Value> = new Map();
  private parent: Environment | null = null;
  private reserved: Set<string> = new Set();

  public async define(
    name: string,
    value: Value,
    sourceContext: SourceLineContext,
  ): RuntimeResult<void> {
    if (reservedVariables.includes(name) || this.reserved.has(name)) {
      return runtimeErr("reservedIdentifier", { name }, sourceContext);
    }
    return this.loadReserved(name, value);
  }

  /**
   * Like define but without any guard (used to load stuff directly from the interpreter)
   */
  public async loadReserved(name: string, value: Value): RuntimeResult<void> {
    this.variables.set(name, value);
    this.reserved.add(name);
    return ok();
  }

  public defineRoot(root: ValueFromType<"HtmlDocument">) {
    this.variables.set("_", root);
  }

  public async get(
    name: string,
    sourceContext: SourceLineContext,
  ): RuntimeResult {
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
