import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import { getPlaylistDetails, parsePlaylistId } from "../../youtube.ts";
import { formatYoutubeVideoToTask } from "../../util.ts";
import { reportIssue } from "../../errors/report.ts";

export default (async ({ uuid }) => {
  try {
    const playlistId = parsePlaylistId(
      (await logseq.Editor.getBlock(uuid))!.content,
    );
    var playlistDetails = await getPlaylistDetails(playlistId);
  } catch (e) {
    await reportIssue("An error occured while querying the playlist : " + e);
    return;
  }

  await logseq.Editor.updateBlock(uuid, playlistDetails.playlistTitle);
  await logseq.Editor.insertBatchBlock(
    uuid,
    playlistDetails.videos.map((video) => ({
      content: formatYoutubeVideoToTask(video),
    })),
    { sibling: false },
  );
  await logseq.Editor.editBlock(uuid);
}) satisfies BlockCommandCallback;
