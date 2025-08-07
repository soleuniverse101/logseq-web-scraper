import { Value, ValueFromType, ValueType, wrapValue } from ".";

const conversions = {
  String: {
    HtmlDocument: (doc) => doc.title,
    Number: (n) => n.toString(),
  },
} as const satisfies {
  [To in ValueType]?: {
    [From in Exclude<ValueType, To>]?: (
      from: ValueFromType<From>["value"],
    ) => ValueFromType<To>["value"];
  };
};

export function convert<
  To extends keyof typeof conversions,
  From extends keyof (typeof conversions)[To],
>(
  value: ValueFromType<To | (From extends ValueType ? From : never)>,
  type: To,
) {
  if ((value as Value).type == type) {
    return value;
  } else {
    return wrapValue(type, (conversions[type] as any)[value.type](value.value));
  }
}
