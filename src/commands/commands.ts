import { BlockCommandCallback } from "@logseq/libs/dist/LSPlugin.user";
import playlistProgression from "./youtube/playlistProgression";
import parse from "./web-scraper/parse";

export default [
  ["Web Scrap : Youtube Playlist Progression 📼", playlistProgression],
  ["Parse Web Content 🌐", parse],
] satisfies [string, BlockCommandCallback][];
