import "@logseq/libs";
import { settings } from "./settings.ts";

import playlistProgression from "./commands/youtube/playlistProgression.ts";

logseq.useSettingsSchema(settings).ready(main).catch(console.error);

function main() {
  logseq.Editor.registerSlashCommand(
    "Web Scrap : Youtube Playlist Progression 📼",
    playlistProgression,
  );
}
