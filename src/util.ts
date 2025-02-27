import { YoutubeVideo } from "./youtube.ts";

export function formatYoutubeVideoToTask({ title, link }: YoutubeVideo) {
  return `TODO [${title}](${link})`;
}
