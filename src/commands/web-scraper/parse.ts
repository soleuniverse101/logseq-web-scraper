import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import { Parser } from "./parser";
import { contentsFromOutput, RawBlock } from "./parser/blocks";
import { reportErrors } from "./errors/report";
import { Interpreter } from "./interpreter";

export default (async ({ uuid }) => {
  const rootSourceBlock = (await logseq.Editor.getBlock(uuid, {
    includeChildren: true,
  }))!;

  const parsing = Parser.parse([rootSourceBlock as RawBlock]);
  if (parsing.isErr()) {
    return reportErrors(parsing);
  }

  const outputResult = await Interpreter.interpret(parsing.value);
  if (outputResult.isErr()) {
    return reportErrors(outputResult);
  }

  await logseq.Editor.insertBatchBlock(
    uuid,
    contentsFromOutput(outputResult.value),
    {
      sibling: true,
    },
  );
}) satisfies BlockCommandCallback;
