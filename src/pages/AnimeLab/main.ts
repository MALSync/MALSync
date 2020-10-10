import { pageInterface } from '../pageInterface';

// Just as a sanity check when sending messages:
const uniqueId = window.crypto.getRandomValues(new Uint32Array(10)).toString();

// Function that, given a metadata extractor, will pull information from the page
function extractMetadata() {
  const videos = JSON.parse(j.$('#malSyncContainer').attr('data-videos') || '[]');

  if (videos.length === 0) {
    throw new Error('Invalid metadata');
  }

  // The "playlist position" variable, however is not reliable (it doesn't get updated
  // on page switches). Match by slug.
  const slug = document.URL.split('/').pop();

  let playlistPosition = -1;

  for (let index = 0; index < videos.length; index++) {
    if (videos[index].videoEntry.slug === slug) {
      playlistPosition = index;
    }
  }

  if (playlistPosition === -1) {
    throw new Error('Failed to identify playlist position');
  }

  return {
    videos,
    playlistPosition,
  };
}

// Adds a metadata extractor intermediary
function addMetaExtractor() {
  // Clean-up after a previous attempt
  const elementToRemove = document.getElementById('malSyncContainer');
  if (elementToRemove !== null) {
    elementToRemove.remove();
  }

  // Extract the "video" attribute, if available
  const scriptElement = document.createElement('script');
  const scriptContents = document.createTextNode(`
    if (window.hasOwnProperty("videos")) {
      const element = document.getElementById('malSyncContainer');
      element.setAttribute("data-videos", JSON.stringify(videos));

      window.postMessage({"uniqueId": "${uniqueId}"}, "*");
    }
  `);

  scriptElement.id = 'malSyncContainer';
  scriptElement.appendChild(scriptContents);
  document.body.append(scriptElement);
}

export const AnimeLab: pageInterface = {
  name: 'AnimeLab',
  domain: 'https://www.animelab.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return url.startsWith('https://www.animelab.com/player/');
  },
  sync: {
    getTitle(url) {
      const meta = extractMetadata();

      // Show title is a little inconsistent in AnimeLab - try to build it ourselves in a MAL-like
      // format:
      const seasonInfo = meta.videos[meta.playlistPosition].videoEntry.season;

      if (seasonInfo.seasonNumber > 1) {
        // Try to see if this season has a custom name - if so, pull that:
        if (seasonInfo.name.length > seasonInfo.showTitle.length && !seasonInfo.name.startsWith('Season')) {
          // The season title has its season number included ("Railgun T" vs "Railgun")
          return seasonInfo.name;
        }

        // Combine the show title and the season number otherwise
        return `${seasonInfo.showTitle} ${seasonInfo.name}`;
      }

      // If this is season 1, just take the title:
      return seasonInfo.showTitle;
    },
    getIdentifier(url) {
      // Identifier is drawn from the same info
      return AnimeLab.sync.getTitle(url);
    },
    getOverviewUrl(url) {
      const meta = extractMetadata();

      return `https://www.animelab.com/shows/${meta.videos[meta.playlistPosition].videoEntry.showSlug}`;
    },
    getEpisode(url) {
      const meta = extractMetadata();

      return parseInt(meta.videos[meta.playlistPosition].videoEntry.episodeNumber);
    },
    nextEpUrl(url) {
      const meta = extractMetadata();

      if (meta.videos.length > meta.playlistPosition + 1) {
        return `https://www.animelab.com/player/${meta.videos[meta.playlistPosition + 1].videoEntry.slug}`;
      }

      // No next video
      return undefined;
    },
  },
  // Overview not available as shows inconsistently use multiple seasons,
  init(page) {
    window.addEventListener(
      'message',
      event => {
        if (!(event instanceof MessageEvent)) {
          return;
        }

        const eventData: MessageEvent = event;

        if (eventData.data.uniqueId.valueOf() !== uniqueId.valueOf()) return;

        page.handlePage();
      },
      false,
    );

    j.$(document).ready(() => {
      addMetaExtractor();

      // If the video changes on the same page (i.e video is queued), we
      // don't get sent to a new page. The metadata, however, does update:
      j.$('#video-component').on('loadstart', () => {
        addMetaExtractor();
      });
    });
  },
};
