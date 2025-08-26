import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";

export default (async ({ uuid }) => {
  const rootSourceBlock = (await logseq.Editor.getBlock(uuid, {
    includeChildren: true,
  }))!;
}) satisfies BlockCommandCallback;
