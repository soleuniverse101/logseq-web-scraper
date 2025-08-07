export type Value = Readonly<
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
) {
  return { type, value };
}
