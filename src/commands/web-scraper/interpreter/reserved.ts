import { ValueFromType } from "../data";

type Reserved = {
  _document: "HtmlDocument";
};

export type ReservedKey = keyof Reserved;
export type ReservedType<Key extends ReservedKey> = ValueFromType<
  Reserved[Key]
>;

export const reservedKeys: string[] = [
  "_document",
] as const satisfies (keyof Reserved)[];
