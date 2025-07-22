import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import playlistProgression from "./youtube/playlistProgression";

export default [
  ["Web Scrap : Youtube Playlist Progression 📼", playlistProgression],
] satisfies [string, BlockCommandCallback][];
