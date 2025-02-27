export class YoutubePlaylistNotFound extends Error {
  constructor() {
    super("Youtube Playlist was not found");
  }
}

export class InvalidPlaylistIDError extends Error {
  constructor() {
    super("Youtube Playlist ID could not be parsed");
  }
}

export class GoogleAPIKeyNotSpecified extends Error {
  constructor() {
    super("Google API Key is required and was not specified");
  }
}
