import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import { Parser } from "../../web-scraper/parser";
import { reportIssue } from "../../errors/report";

export default (async ({ uuid }) => {
  const rootSourceBlock = (await logseq.Editor.getBlock(uuid, {
    includeChildren: true,
  }))!;

  const parser = new Parser([rootSourceBlock]);
  const result = parser.parse();

  if (result.isErr()) {
    for (const error of result.error) {
      await reportIssue(error.message);
    }
  }
}) satisfies BlockCommandCallback;
