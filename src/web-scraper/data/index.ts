import { ASTNodeFromType } from "../parser/ast";
import { StandardFunction } from "./functions";

export type Value = Readonly<
  | { type: "Object"; value: Map<string, Value> }
  | { type: "Array"; value: Value[] }
  | {
      type: "UserFunction";
      value: Omit<ASTNodeFromType<"lambda">, "type">;
    }
  | {
      type: "StandardFunction";
      value: StandardFunction;
    }
  | {
      type: "HtmlDocument";
      value: HTMLDocument;
    }
  | {
      type: "String";
      value: string;
    }
  | { type: "Number"; value: number }
>;

export type ValueType = Value["type"];
export type ValueFromType<Type extends ValueType> = Extract<
  Value,
  { type: Type }
>;

export function wrapValue<Type extends ValueType>(
  type: Type,
  value: ValueFromType<Type>["value"],
): ValueFromType<Type> {
  return { type, value } as ValueFromType<Type>;
}
