import { Value, ValueFromType, ValueType } from "../data";

const reserved = {
  inherited: {
    _document: "HtmlDocument",
    _documentUrl: "String",
    _current: "HtmlElement",
  } satisfies Record<string, ValueType>,
  initialized: {} satisfies Record<string, () => Value>,
} as const;
export const reservedValues = {
  ...reserved,
  all: Object.fromEntries(
    Object.values(reserved).flatMap(Object.entries),
  ) as Record<ReservedKey, ValueType>,
};

export type Reserved = typeof reserved;
export type ReservedKey =
  | keyof Reserved["inherited"]
  | keyof Reserved["initialized"];
export type ReservedType<Key extends ReservedKey> =
  Key extends keyof Reserved["inherited"]
    ? ValueFromType<Reserved["inherited"][Key]>
    : Key extends keyof Reserved["initialized"]
      ? ReturnType<Reserved["initialized"][Key]>
      : never;

export const reservedKeys = {
  inherited: Object.keys(
    reserved.inherited,
  ) as (keyof typeof reserved.inherited)[],
  initialized: Object.keys(
    reserved.initialized,
  ) as (keyof typeof reserved.initialized)[],
  all: Object.keys(reserved.inherited).concat(
    ...Object.keys(reserved.initialized),
  ),
};
