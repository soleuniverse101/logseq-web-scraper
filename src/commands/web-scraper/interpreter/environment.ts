import { ok } from "neverthrow";
import { RuntimeResult } from ".";
import { Value, wrapValue } from "../data";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr } from "../errors/runtime-errors";
import {
  Reserved,
  reserved,
  ReservedKey,
  reservedKeys,
  ReservedType,
} from "./reserved";

export class Environment {
  private readonly variables: Map<String, Value> = new Map();
  private parent: Environment | null = null;

  public async define(
    name: string,
    value: Value,
    sourceContext: SourceLineContext,
  ): RuntimeResult<void> {
    if (reservedKeys.includes(name)) {
      return runtimeErr("reservedIdentifier", { name }, sourceContext);
    }
    return this.load(name, value);
  }

  /**
   * Like define but without any guard (used to load stuff directly from the interpreter)
   */
  public async load(name: string, value: Value): RuntimeResult<void> {
    this.variables.set(name, value);
    return ok();
  }

  public loadReserved<Key extends ReservedKey>(
    element: Key,
    rawValue: ReservedType<Key>["value"],
  ) {
    this.variables.set(
      element,
      wrapValue<Reserved[Key]>(reserved[element], rawValue as any),
    );
  }
  public getReserved<Key extends ReservedKey>(
    element: Key,
  ): ReservedType<Key>["value"] {
    const value = this.variables.get(element);
    if (!value) {
      throw new Error("Reserved value not defined");
    }
    return value.value as ReservedType<Key>["value"];
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

    return runtimeErr("identifierNotFound", { name }, sourceContext);
  }

  public extendScope() {
    let env = new Environment();
    env.parent = this;

    for (const key of reservedKeys) {
      const value = this.variables.get(key);
      if (value) {
        env.load(key, value);
      }
    }

    return env;
  }

  public outScope() {
    if (this.parent) {
      return this.parent;
    }
    throw new Error("Cannot leave the root scope");
  }
}
