import "fs";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const FOLDER_PATH = "src/commands/web-scraper/examples/pages";

const files = readdirSync(FOLDER_PATH);

const pages = {};
for (const file of files) {
  const match = /^(?<name>.+)\.(?<extension>.+)$/.exec(file);
  if (!["html"].includes(match.groups.extension)) {
    continue;
  }
  pages[`/${match.groups.name}`] = readFileSync(path.join(FOLDER_PATH, file)).toString();
}

const content = `export const testPages: Record<string, string> = ${JSON.stringify(pages)};`;

writeFileSync(path.join(FOLDER_PATH, "testPages.ts"), content,);