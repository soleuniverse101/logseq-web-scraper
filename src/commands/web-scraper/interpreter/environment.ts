import { ok } from "neverthrow";
import { RuntimeResult } from ".";
import { Value, wrapValue } from "../data";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr } from "../errors/runtime-errors";
import {
  ReservedKey,
  reservedKeys,
  ReservedType,
  reservedValues,
} from "./reserved";

export class Environment {
  private readonly variables: Map<String, Value> = new Map();
  private parent: Environment | null = null;

  public constructor() {
    for (const initialized of reservedKeys.initialized) {
      this.load(initialized, reservedValues.initialized[initialized]());
    }
  }

  public async define(
    name: string,
    value: Value,
    sourceContext: SourceLineContext,
  ): RuntimeResult<void> {
    if (reservedKeys.all.includes(name)) {
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
      wrapValue<ReservedType<Key>["type"]>(
        reservedValues.all[element] as ReservedType<Key>["type"],
        rawValue as any,
      ),
    );
  }
  public getReserved<Key extends ReservedKey>(
    element: Key,
  ): ReservedType<Key>["value"] {
    const value = this.variables.get(element);
    if (!value) {
      throw new Error(`Reserved value ${element} not defined`);
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

    for (const key of reservedKeys.inherited) {
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
