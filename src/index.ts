import "@logseq/libs";
import { settings } from "./settings.ts";

import commands from "./commands/commands.ts";

logseq.useSettingsSchema(settings).ready(main).catch(console.error);

function main() {
  for (const [tag, action] of commands) {
    logseq.Editor.registerSlashCommand(tag, action);
  }
}
