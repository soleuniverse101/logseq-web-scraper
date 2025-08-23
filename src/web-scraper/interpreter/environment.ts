import { ok } from "neverthrow";
import { RuntimeResult } from ".";
import {
  Value,
  ValueFromType,
  ValuesArray,
  ValueType,
  wrapArray,
  wrapObject,
  wrapValue,
} from "../data";
import { runtimeErr } from "../errors/interpreter-errors";
import { SourceLineContext } from "../errors/parser-errors";
import { reservedVariables } from "./standard/standard-variables";

export type ElementInputs = Pick<HTMLElement, "textContent"> & {
  pageTitle: string;
  pageURL: string;
};

const root = {
  document: "HtmlDocument",
  currentElement: "HtmlElement",
  siblings: wrapArray() as ValuesArray<"HtmlElement">,
  siblingsMap: wrapObject(),
} as const satisfies Record<string, ValueType | Value>;
type Root = typeof root;
type RootElement<Element extends keyof Root> = Root[Element] extends ValueType
  ? ValueFromType<Root[Element]>
  : Root[Element] extends Value
    ? Root[Element]
    : never;
const rootElements = Object.keys(root) as (keyof Root)[];

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

  public setRootElement<Element extends keyof Root>(
    element: Element,
    value: RootElement<Element>,
  ) {
    (this.variables.get("_")!.value as Map<string, Value>).set(element, value);
  }
  public getRootElement<Element extends keyof Root>(
    element: Element,
  ): RootElement<Element> {
    return (this.variables.get("_")!.value as Map<string, Value>).get(
      element,
    )! as RootElement<Element>;
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

    // Shallow copy root
    const rootMap = new Map();
    env.loadReserved("_", wrapValue("Object", rootMap));
    for (const rootElement of rootElements) {
      rootMap.set(rootElement, this.getRootElement(rootElement));
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
