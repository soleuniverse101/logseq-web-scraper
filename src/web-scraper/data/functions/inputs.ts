import { err, ok, Result } from "neverthrow";
import { Value, ValueFromType, ValueType } from "..";

export type InputModel<Unwrapped> = {
  type: "typedArray";
  valueType: "Array";
  unwrap: (value: Value) => Result<Unwrapped, void>;
  toString: () => string;
};

export function typedArray<Model extends TypedArrayModel>(
  model: Model,
): InputModel<UnwrappedArrayValues<ValueFromTypedArray<Model>>> {
  return {
    type: "typedArray",
    valueType: "Array",
    unwrap: (value) => {
      if (value.type != "Array") {
        return err();
      }
      return unwrapTypedArray(value, model);
    },
    toString: () => toString(model),
  };
}

type TypedArrayModel = [Exclude<ValueType, "SystemCall">] | [TypedArrayModel];

// let m = ["String"] satisfies TypedArrayModel;

type ValueFromTypedArray<Array extends TypedArrayModel> = {
  type: "Array";
  value: (Array extends [infer T extends ValueType]
    ? ValueFromType<T>
    : Array extends [infer A extends TypedArrayModel]
      ? ValueFromTypedArray<A>
      : never)[];
};

// let v: ExpandRecursively<ValueFromTypedArray<typeof m>>;

type UnwrappedArrayValues<Array extends ValueFromType<"Array">> =
  Array extends {
    value: (infer V extends ValueFromType<Exclude<ValueType, "Array">>)[];
  }
    ? V["value"][]
    : Array extends { value: (infer A extends ValueFromType<"Array">)[] }
      ? UnwrappedArrayValues<A>[]
      : never;

// let u: UnwrappedArrayValues<typeof v>;

export function unwrapTypedArray<Model extends TypedArrayModel>(
  { value: values }: ValueFromType<"Array">,
  model: Model,
): Result<UnwrappedArrayValues<ValueFromTypedArray<Model>>, void> {
  type ReturnType = UnwrappedArrayValues<ValueFromTypedArray<Model>>;
  if (values.length == 0) {
    return ok([] as ReturnType);
  } else if (typeof model[0] == "string") {
    return values.every(({ type }) => type == model[0])
      ? ok(values.map(({ value }) => value) as ReturnType)
      : err();
  }

  const elements: UnwrappedArrayValues<ValueFromTypedArray<Model>> =
    [] as ReturnType;

  for (const value of values) {
    if (value.type != "Array") {
      return err();
    }
    const unwrapped = unwrapTypedArray(value, model[0]);
    if (unwrapped.isErr()) {
      return unwrapped;
    }
    elements.push(unwrapped.value);
  }

  return ok(elements);
}

function toString(model: TypedArrayModel): string {
  return `[${typeof model[0] == "string" ? model[0] : toString(model[0])}]`;
}
