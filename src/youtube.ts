import { GoogleAPIKeyNotSpecified, InvalidPlaylistIDError, YoutubePlaylistNotFound } from "./errors/youtube-errors.ts";

type YoutubeAPI = typeof gapi.client.youtube;

export interface YoutubeVideo {
  title: string;
  link: string;
}

async function createYoutubeAPI(): Promise<YoutubeAPI> {
  logseq;
  if (logseq.settings!.googleApiKey === "") {
    throw new GoogleAPIKeyNotSpecified();
  }

  return new Promise((resolve) => {
    gapi.load("client", async () => {
      await gapi.client.init({
        apiKey: logseq.settings!.googleApiKey as string,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
        ],
      });

      resolve(gapi.client.youtube);
    });
  });
}

const RESPONSE_MAX_RESULTS = 50; // between 0 and 50 (inclusive)

let youtube: YoutubeAPI | null = null;
let youtubeInit = false;
const getYoutubeAPI: () => Promise<YoutubeAPI> = async () => {
  if (youtubeInit) {
    if (!youtube) {
      throw new GoogleAPIKeyNotSpecified();
    }
    return youtube;
  }

  youtube = await createYoutubeAPI();
  youtubeInit = true;
  return youtube;
};

export async function getPlaylistDetails(playlistId: string) {
  const youtube = await getYoutubeAPI();

  try {
    const playlistTitle = (await youtube.playlists.list({
      part: "snippet",
      id: playlistId
    })).result.items![0].snippet!.title!;

    const videos: YoutubeVideo[] = [];

    let nextPageToken: string | undefined = undefined;

    do {
      const { result } = await youtube.playlistItems.list({
        part: "snippet",
        maxResults: RESPONSE_MAX_RESULTS,
        playlistId,
        pageToken: nextPageToken,
      });

      nextPageToken = result.nextPageToken;

      videos.push(...result.items!.map((playlistItem) => ({
        title: playlistItem.snippet!.title!,
        link: getVideoLink(playlistItem.snippet!.resourceId!.videoId!)
      })));
    } while (nextPageToken);

    return { playlistTitle, videos };
  } catch (e) {
    if (e instanceof GoogleAPIKeyNotSpecified) {
      throw e;
    }
    throw new YoutubePlaylistNotFound();
  }
}

function getVideoLink(id: string) {
  return "https://www.youtube.com/watch?v=" + id;
}

const playlistRegex = /^PL[A-Za-z0-9_-]{32}$/;

function checkPlaylistID(id: string) {
  if (playlistRegex.test(id)) {
    return id;
  }
  throw new InvalidPlaylistIDError();
}

/**
 * Parse a text to extract a Youtube Playlist ID. Possible forms of text are : the ID itself, or the link to the playlist
 * @param text text to parse
 */
export function parsePlaylistId(text: string) {
  try {
    var url = new URL(text);
  } catch (e) {
    return checkPlaylistID(text);
  }

  if ((url.pathname === "/playlist" || url.pathname === "/watch") && url.searchParams.has("list")) {
    return checkPlaylistID(url.searchParams.get("list")!);
  }

  throw new InvalidPlaylistIDError();
}
