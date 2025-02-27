# Web Scraping Logseq Plugin

## Plugin

I created this plugin to solve a particular issue I face from time to time : the need to mirror the structure of a website's entries into a structure of Logseq blocks in order to keep track of specific information, each related to the said entries. One example of such a case is when I'm following a Youtube Playlist and need to create a block per video of the playlist to take notes of it.

Currently, the only feature I implemented is the Youtube Playlist scraping. I intend to add other types of web scraping when I need them to not bloat the plugin, and because I don't have a lot of free time.

However, if you need a specific feature, you can always suggest it in [this repo's issues](https://github.com/soleuniverse101/logseq-web-scraper/issues). If I find the time to implement it, I could try to add it. You may also discuss the possibility of adding it yourself through a pull request, but please inform me first before doing so.

### Features

- Youtube Playlists Progression 📼 : Create a youtube playlist progression with each video as a TODO block in logseq

## How to set up the plugin

Currently only have to set up the plugin for the `Youtube Playlist Progression 📼` feature :

### Youtube Playlist Progression 📼

This plugin uses the [Youtube Data API](https://developers.google.com/youtube/v3) to query Youtube playlists. To access this API, you need to enter a Google API key in the plugin settings page. To set it up, follow steps 1 through 4 of [this link](https://developers.google.com/youtube/v3/getting-started#before-you-start) to create an API key and to enable the Youtube Data API on your Google account. **Note that you don't need an OAuth 2.0 Authorization, just a simple API key**

## Development

### Todo

- ❌ Web scrapping of generic static pages by describing their structure using a format ressembling XML
- ❌ Add option to cherry pick features to enable in plugin settings

### How to set up the development environment

- [Install pnpm (package manager)](https://pnpm.io/installation)
- Test functions by running a [Vite](https://vite.dev/) hot reloaded server using `pnpm dev`
- To test the plugin in Logseq :
  - Start hot rebuilding it using `pnpm dev-logseq`
  - In the plugin list page, click `Load unpacked plugin` and select the root folder (the folder containing `package.json`)
  - After each change, wait for the `dist` folder to be rebuilt, then click `reload` under the plugin (in the plugins list page)
