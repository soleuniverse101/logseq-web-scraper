import { InterpreterHandle, OutputNode } from ".";
import { SystemCall } from "../data/system-calls";
import { Block } from "../parser/blocks";

export async function interpretSystemCall(
  interpreter: InterpreterHandle,
  output: OutputNode[],
  sysCall: SystemCall,
  node: Block,
) {
  switch (sysCall.type) {
    case "generateContext":
      interpreter.extendScope();
      sysCall.context.prepareEnv(interpreter.getEnvironment());

      const exec = await interpreter.interpret(node.children, output);
      if (exec.isErr()) {
        return exec;
      }

      interpreter.outScope();

      break;
    case "generateContexts":
      for (const { prepareEnv } of sysCall.contexts) {
        interpreter.extendScope();
        prepareEnv(interpreter.getEnvironment());

        const exec = await interpreter.interpret(node.children, output);
        if (exec.isErr()) {
          return exec;
        }

        interpreter.outScope();
      }
  }
}
