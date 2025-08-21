import { err, ok } from "neverthrow";
import { Value, ValueFromType, ValueType, wrapNull, wrapValue } from "..";
import { runtimeErr } from "../../errors/interpreter-errors";
import { SourceLineContext } from "../../errors/parser-errors";
import { RuntimeResult } from "../../interpreter";
import { Environment } from "../../interpreter/environment";
import { InputModel } from "./inputs";

export type StandardFunction = {
  // Can be empty
  inputTypes: ValueType[];
  optionalInputTypes: ValueType[];
  outputType: ValueType;
  map: (
    inputs: Value[],
    env: Environment,
    sourceContext: SourceLineContext,
  ) => RuntimeResult;
};

export type Input = Exclude<ValueType, "SystemCall"> | InputModel<unknown>;
type MapInput<I extends Input> = I extends ValueType
  ? ValueFromType<I>["value"]
  : I extends InputModel<infer Unwrapped>
    ? Unwrapped
    : never;

type MapInputs<Inputs extends Input[], Optional extends boolean = false> = {
  [Index in keyof Inputs]: Optional extends false
    ? MapInput<Inputs[Index]>
    : MapInput<Inputs[Index]> | undefined;
};

export function createFunction<
  Inputs extends Input[],
  Output extends ValueType,
>(
  inputModels: [...Inputs],
  outputType: Output,
  map: (
    inputs: MapInputs<Inputs>,
    env: Environment,
    sourceContext: SourceLineContext,
  ) => RuntimeResult<ValueFromType<Output>["value"]>,
): StandardFunction {
  return {
    inputTypes: inputModels.map(inputValueType),
    optionalInputTypes: [],
    outputType,
    map: async (inputs, env, sourceContext) => {
      const inputsCheck = await unwrapInputs(
        { inputs: inputModels, optionalInputs: [] },
        inputs,
        sourceContext,
      );

      if (inputsCheck.isErr()) {
        return err(inputsCheck.error);
      }

      const result = await map(inputsCheck.value.inputs, env, sourceContext);

      if (result.isErr()) {
        return err(result.error);
      } else if (outputType == "Null") {
        return ok(wrapNull());
      }
      return ok(wrapValue(outputType, result.value as any));
    },
  };
}

export function createFunctionWithOptions<
  Inputs extends Input[],
  OptionalInputs extends Input[],
  Output extends ValueType,
>(
  inputModels: [...Inputs],
  optionalInputModels: [...OptionalInputs],
  outputType: Output,
  map: (
    inputs: MapInputs<Inputs>,
    optionalInputs: MapInputs<OptionalInputs, true>,
    env: Environment,
    sourceContext: SourceLineContext,
  ) => RuntimeResult<ValueFromType<Output>["value"]>,
): StandardFunction {
  return {
    inputTypes: inputModels.map(inputValueType),
    optionalInputTypes: optionalInputModels.map(inputValueType),
    outputType,
    map: async (inputs, env, sourceContext) => {
      const inputsCheck = await unwrapInputs(
        { inputs: inputModels, optionalInputs: optionalInputModels },
        inputs,
        sourceContext,
      );

      if (inputsCheck.isErr()) {
        return err(inputsCheck.error);
      }

      const result = await map(
        inputsCheck.value.inputs,
        inputsCheck.value.optionalInputs,
        env,
        sourceContext,
      );

      if (result.isErr()) {
        return err(result.error);
      } else if (outputType == "Null") {
        return ok(wrapNull());
      }
      return ok(wrapValue(outputType, result.value as any));
    },
  };
}

async function unwrapInputs<
  Inputs extends Input[],
  OptionalInputs extends Input[],
>(
  expected: {
    inputs: Inputs;
    optionalInputs: OptionalInputs;
  },
  inputs: Value[],
  sourceContext: SourceLineContext,
): RuntimeResult<{
  inputs: MapInputs<Inputs>;
  optionalInputs: MapInputs<OptionalInputs, true>;
}> {
  const inputsCount = inputs.length;
  if (
    inputsCount < expected.inputs.length ||
    inputsCount > expected.inputs.length + expected.optionalInputs.length
  ) {
    return runtimeErr(
      "wrongArgumentsCount",
      expected.optionalInputs.length == 0
        ? {
            type: "precise",
            expectedCount: expected.inputs.length,
            actualCount: inputs.length,
          }
        : {
            type: "interval",
            minCount: expected.inputs.length,
            maxCount: expected.inputs.length + expected.optionalInputs.length,
            actualCount: inputs.length,
          },
      sourceContext,
    );
  }

  const unwrapped = [];

  for (let i = 0; i < inputsCount; i++) {
    let expectedType =
      i < expected.inputs.length
        ? expected.inputs[i]
        : expected.optionalInputs[i % expected.inputs.length];
    if (typeof expectedType == "string" && inputs[i].type == expectedType) {
      unwrapped.push(inputs[i]["value"]);
      continue;
    } else if (typeof expectedType != "string") {
      const result = expectedType.unwrap(inputs[i]);
      if (result.isOk()) {
        unwrapped.push(result.value);
        continue;
      }
    }
    return runtimeErr(
      "wrongArgumentsTypes",
      {
        expectedTypes: expected.inputs,
        expectedOptionalTypes: expected.optionalInputs,
        actualTypes: inputs.map(({ type }) => type),
      },
      sourceContext,
    );
  }

  return ok({
    inputs: unwrapped.slice(0, expected.inputs.length) as MapInputs<Inputs>,
    optionalInputs: unwrapped.slice(expected.inputs.length) as MapInputs<
      OptionalInputs,
      true
    >,
  });
}

function inputValueType(input: Input) {
  return typeof input == "string" ? (input as ValueType) : input.valueType;
}
