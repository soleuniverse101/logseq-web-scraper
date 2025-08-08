import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import { Parser } from "../../web-scraper/parser";
import { reportIssues } from "../../errors/report";
import { Interpreter } from "../../web-scraper/interpreter";
import { contentsFromOutput } from "../../web-scraper/parser/blocks";

export default (async ({ uuid }) => {
  const rootSourceBlock = (await logseq.Editor.getBlock(uuid, {
    includeChildren: true,
  }))!;

  const parsing = Parser.parse([rootSourceBlock]);
  if (parsing.isErr()) {
    return reportIssues(parsing);
  }

  const output = Interpreter.interpret(parsing.value);
  if (output.isErr()) {
    return reportIssues(output);
  }

  await logseq.Editor.insertBatchBlock(uuid, contentsFromOutput(output.value), {
    sibling: true,
  });
}) satisfies BlockCommandCallback;
