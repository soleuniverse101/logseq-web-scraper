import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import parse from "../web-parser/parse-command";
import playlistProgression from "./youtube/playlistProgression";

export default [
  ["Web Scrap : Youtube Playlist Progression 📼", playlistProgression],
  ["Parse Web Content 🌐", parse],
] satisfies [string, BlockCommandCallback][];
