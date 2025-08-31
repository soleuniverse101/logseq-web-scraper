import { ValueFromType, ValueType } from "../data";

export const reserved = {
  _document: "HtmlDocument",
  _current: "HtmlElement",
} as const satisfies Record<string, ValueType>;

export type Reserved = typeof reserved;
export type ReservedKey = keyof Reserved;
export type ReservedType<Key extends ReservedKey> = ValueFromType<
  Reserved[Key]
>;

export const reservedKeys = Object.keys(reserved);
