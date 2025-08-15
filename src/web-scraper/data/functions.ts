import { err, ok } from "neverthrow";
import { Value, ValueFromType, ValueType, wrapNull, wrapValue } from ".";
import { RuntimeResult } from "../interpreter";
import { Environment } from "../interpreter/environment";
import { SourceLineContext } from "../errors/parser-errors";
import { runtimeErr } from "../errors/interpreter-errors";

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

export function createFunction<
  Inputs extends ValueType[],
  Output extends ValueType,
>(
  inputTypes: [...Inputs],
  outputType: Output,
  map: (
    inputs: {
      [Index in keyof Inputs]: ValueFromType<Inputs[Index]>["value"];
    },
    env: Environment,
    sourceContext: SourceLineContext,
  ) => RuntimeResult<ValueFromType<Output>["value"]>,
): StandardFunction {
  return {
    inputTypes,
    optionalInputTypes: [],
    outputType,
    map: async (inputs, env, sourceContext) => {
      const inputsCheck = await checkInputs(
        { inputs: inputTypes, optionalInputs: [] },
        inputs.map(({ type }) => type),
        sourceContext,
      );

      if (inputsCheck.isErr()) {
        return err(inputsCheck.error);
      }

      const result = await map(
        inputs.map(({ value }) => value) as {
          [Index in keyof Inputs]: ValueFromType<Inputs[Index]>["value"];
        },
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

export function createFunctionWithOptions<
  Inputs extends ValueType[],
  OptionalInputs extends ValueType[],
  Output extends ValueType,
>(
  inputTypes: [...Inputs],
  optionalInputTypes: [...OptionalInputs],
  outputType: Output,
  map: (
    inputs: {
      [Index in keyof Inputs]: ValueFromType<Inputs[Index]>["value"];
    },
    optionalInputs: {
      [Index in keyof OptionalInputs]:
        | ValueFromType<OptionalInputs[Index]>["value"]
        | undefined;
    },
    env: Environment,
    sourceContext: SourceLineContext,
  ) => RuntimeResult<ValueFromType<Output>["value"]>,
): StandardFunction {
  return {
    inputTypes,
    optionalInputTypes,
    outputType,
    map: async (inputs, env, sourceContext) => {
      const inputsCheck = await checkInputs(
        { inputs: inputTypes, optionalInputs: optionalInputTypes },
        inputs.map(({ type }) => type),
        sourceContext,
      );

      if (inputsCheck.isErr()) {
        return err(inputsCheck.error);
      }

      const result = await map(
        inputs.slice(0, inputTypes.length).map(({ value }) => value) as {
          [Index in keyof Inputs]: ValueFromType<Inputs[Index]>["value"];
        },
        inputs.slice(inputTypes.length).map(({ value }) => value) as {
          [Index in keyof OptionalInputs]:
            | ValueFromType<OptionalInputs[Index]>["value"]
            | undefined;
        },
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

async function checkInputs(
  expected: { inputs: ValueType[]; optionalInputs: ValueType[] },
  actual: ValueType[],
  sourceContext: SourceLineContext,
): RuntimeResult<void> {
  const inputsCount = actual.length;
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
            actualCount: actual.length,
          }
        : {
            type: "interval",
            minCount: expected.inputs.length,
            maxCount: expected.inputs.length + expected.optionalInputs.length,
            actualCount: actual.length,
          },
      sourceContext,
    );
  }

  for (let i = 0; i < inputsCount; i++) {
    let expectedType =
      i < expected.inputs.length
        ? expected.inputs[i]
        : expected.optionalInputs[i % expected.inputs.length];
    if (actual[i] != expectedType) {
      return runtimeErr(
        "wrongArgumentsTypes",
        {
          expectedTypes: expected.inputs,
          expectedOptionalTypes: expected.optionalInputs,
          actualTypes: actual,
        },
        sourceContext,
      );
    }
  }

  return ok();
}
