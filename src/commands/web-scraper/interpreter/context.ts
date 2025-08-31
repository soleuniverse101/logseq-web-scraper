import { InterpreterHandle, OutputNode } from ".";
import { ValueFromType } from "../data";
import { Block } from "../parser/blocks";
import { Environment } from "./environment";

export type Contexts = {
  prepareEnv: (env: Environment) => void;
  // value: Value;
}[];

export async function interpretContext(
  interpreter: InterpreterHandle,
  output: OutputNode[],
  contexts: Contexts,
  node: Block,
) {
  for (const { prepareEnv } of contexts) {
    interpreter.extendScope();
    prepareEnv(interpreter.getEnvironment());

    const exec = await interpreter.interpret(node.children, output);
    if (exec.isErr()) {
      return exec;
    }

    interpreter.outScope();
  }
}

export function context(
  prepareEnv: (env: Environment) => void,
): ValueFromType<"Contexts"> {
  return { type: "Contexts", value: [{ prepareEnv }] };
}
