import { ok } from "neverthrow";
import { Value, ValueFromType, ValueType, wrapValue } from ".";
import { RuntimeResult } from "../interpreter";
import { runtimeErr } from "../errors/interpreter-errors";
import { SourceLineContext } from "../errors/parser-errors";

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
): ValueFromType<To> {
  if ((value as Value).type == type) {
    return value as ValueFromType<To>;
  } else {
    return wrapValue(
      type,
      (conversions[type] as any)[value.type](value.value),
    ) as ValueFromType<To>;
  }
}

export function faillibleConvert<To extends keyof typeof conversions>(
  value: Value,
  type: To,
  sourceContext: SourceLineContext,
): RuntimeResult<ValueFromType<To>> {
  if (value.type == type) {
    return ok(value as ValueFromType<To>);
  } else if (type in conversions && value.type in conversions[type]) {
    return ok(
      wrapValue(type, (conversions[type] as any)[value.type](value.value)),
    );
  } else {
    return runtimeErr(
      "unsupportedConvert",
      { from: value.type, to: type },
      sourceContext,
    );
  }
}
