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
      for (const { prepareEnv, value } of sysCall.contexts) {
        interpreter.extendScope();
        prepareEnv(interpreter.getEnvironment());

        const outputNode: OutputNode = {
          value,
          children: [],
          context: interpreter.getSourceContext(),
        };
        output.push(outputNode);

        const exec = await interpreter.interpret(
          node.children,
          outputNode.children,
        );
        if (exec.isErr()) {
          return exec;
        }

        interpreter.outScope();
      }
  }
}
