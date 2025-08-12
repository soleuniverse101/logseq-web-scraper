import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import { Parser } from "../../web-scraper/parser";
import { Interpreter } from "../../web-scraper/interpreter";
import { contentsFromOutput } from "../../web-scraper/parser/blocks";
import { reportErrors } from "../../web-scraper/errors/report";

export default (async ({ uuid }) => {
  const rootSourceBlock = (await logseq.Editor.getBlock(uuid, {
    includeChildren: true,
  }))!;

  const parsing = Parser.parse([rootSourceBlock]);
  if (parsing.isErr()) {
    return reportErrors(parsing);
  }

  const outputResult = await Interpreter.interpret(parsing.value);
  if (outputResult.isErr()) {
    return reportErrors(outputResult);
  }

  const contents = await contentsFromOutput(outputResult.value);
  if (contents.isErr()) {
    return reportErrors(contents);
  }

  await logseq.Editor.insertBatchBlock(uuid, contents.value, {
    sibling: true,
  });
}) satisfies BlockCommandCallback;
