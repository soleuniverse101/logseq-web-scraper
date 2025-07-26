import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import { reportIssue } from "../../errors/report";
import { parseRootBlock } from "./requests/blocks";
import init from "refltag";

export default (async ({ uuid }) => {
  await init();

  const rootSourceBlock = (await logseq.Editor.getBlock(uuid, {
    includeChildren: true,
  }))!;

  const root = parseRootBlock(rootSourceBlock);
  console.log({ root });
  if (!root.instruction.selector.externalSource) {
    await reportIssue(
      "The first argument after the type of a root block must be a URL",
    );
    return;
  }
}) satisfies BlockCommandCallback;
