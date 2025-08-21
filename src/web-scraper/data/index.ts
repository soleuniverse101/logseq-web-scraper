import { ASTNodeFromType } from "../parser/ast";
import { StandardFunction } from "./functions";
import { SystemCall } from "./system-calls";

export type Value = Readonly<
  | {
      type: "UserFunction";
      value: Omit<ASTNodeFromType<"lambda">, "type">;
    }
  | {
      type: "StandardFunction";
      value: StandardFunction;
    }
  | { type: "Object"; value: Map<string, Value> }
  | { type: "Array"; value: Value[] }
  | {
      type: "HtmlDocument";
      value: HTMLDocument;
    }
  | {
      type: "HtmlElement";
      value: HTMLElement;
    }
  | {
      type: "String";
      value: string;
    }
  | { type: "Number"; value: number }
  | { type: "Null"; value: null }
  // Interpreter signals/hooks that can only be produced with standard functions
  | { type: "SystemCall"; value: SystemCall }
>;

export type ValueType = Value["type"];
export type NonNullValueType = Exclude<ValueType, "Null">;
export type ValueFromType<Type extends ValueType> = Extract<
  Value,
  { type: Type }
>;

export function wrapValue<Type extends NonNullValueType>(
  type: Type,
  value: ValueFromType<Type>["value"],
): ValueFromType<Type> {
  return { type, value } as ValueFromType<Type>;
}
export function wrapArray(...values: Value[]): ValueFromType<"Array"> {
  return { type: "Array", value: values };
}
export function wrapNull(): ValueFromType<"Null"> {
  return { type: "Null", value: null };
}
