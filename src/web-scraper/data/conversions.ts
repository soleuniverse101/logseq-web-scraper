import { err, ok } from "neverthrow";
import { Value, ValueFromType, ValueType, wrapValue } from ".";
import { RuntimeResult } from "../interpreter";
import {
  contextlessRuntimeErr,
  runtimeErr,
  RuntimeError,
} from "../errors/interpreter-errors";
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

const faillibleConversions = {
  String: {
    Object: async (obj) => {
      const mappings: string[] = [];
      for (const [key, value] of obj.entries()) {
        const result = await contextlessFaillibleConvert(value, "String");
        if (result.isErr()) {
          return err(result.error);
        }
        mappings.push(`${key}: ${result.value.value}`);
      }
      return ok(mappings.length == 0 ? "{}" : `{ ${mappings.join(", ")} }`);
    },
    Array: async (array) => {
      const elements: string[] = [];
      for (const value of array) {
        const result = await contextlessFaillibleConvert(value, "String");
        if (result.isErr()) {
          return err(result.error);
        }
        elements.push(result.value.value);
      }
      return ok(elements.length == 0 ? "[]" : `[ ${elements.join(", ")} ]`);
    },
  },
} as const satisfies {
  [To in ValueType]?: {
    [From in Exclude<
      ValueType,
      To extends keyof typeof conversions
        ? keyof (typeof conversions)[To] | To
        : To
    >]?: (
      from: ValueFromType<From>["value"],
    ) => RuntimeResult<ValueFromType<To>["value"]>;
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

async function _faillibleConvert<To extends keyof typeof conversions>(
  value: Value,
  type: To,
  sourceContext?: SourceLineContext,
): RuntimeResult<ValueFromType<To>> {
  if (value.type == type) {
    return ok(value as ValueFromType<To>);
  } else if (type in conversions && value.type in conversions[type]) {
    return ok(
      wrapValue(type, (conversions[type] as any)[value.type](value.value)),
    );
  } else if (
    type in faillibleConversions &&
    value.type in faillibleConversions[type]
  ) {
    let result = (
      await ((faillibleConversions[type] as any)[value.type](
        value.value,
      ) as RuntimeResult<ValueFromType<To>["value"]>)
    ).map((value) => wrapValue(type, value));
    if (sourceContext) {
      result = result.mapErr((error) =>
        RuntimeError.withContext(error, sourceContext),
      );
    }
    return result;
  } else {
    return sourceContext
      ? runtimeErr(
          "unsupportedConvert",
          { from: value.type, to: type },
          sourceContext,
        )
      : contextlessRuntimeErr("unsupportedConvert", {
          from: value.type,
          to: type,
        });
  }
}

export async function faillibleConvert<To extends keyof typeof conversions>(
  value: Value,
  type: To,
  sourceContext: SourceLineContext,
): RuntimeResult<ValueFromType<To>> {
  return _faillibleConvert(value, type, sourceContext);
}

export async function contextlessFaillibleConvert<
  To extends keyof typeof conversions,
>(value: Value, type: To): RuntimeResult<ValueFromType<To>> {
  return _faillibleConvert(value, type);
}
