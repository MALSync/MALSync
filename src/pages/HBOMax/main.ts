import { pageInterface } from '../pageInterface';
import {
  interceptFetch,
  parseSeasonEpisodeText,
  slugifyTitle,
} from '../../utils/streamingProviderHelpers';

let episode = 1;
let season = 1;
let hboMaxId: string | undefined;
let name = '';
let nextEp = '';

const TITLE_SELECTOR = '[data-testid="player-ux-asset-title"]';
const SEASON_EPISODE_SELECTOR = '[data-testid="player-ux-season-episode"]';
// HBO Max's "up next" API response, used to resolve a link to the next episode.
const API_URL_MATCH = 'nextVideos';

export const HBOMax: pageInterface = {
  name: 'HBOMax',
  domain: 'https://www.max.com',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url: string) {
    return url.includes('/video/') || url.includes('/watch/');
  },
  sync: {
    getTitle() {
      return name;
    },
    getIdentifier() {
      // Deliberately title-based (not `hboMaxId`): the id segment parsed out
      // of HBO Max's /video/watch/{a}/{b} URL was only confirmed for a single
      // episode. If it turns out to be per-episode rather than per-series,
      // using it here would silently break episode progress tracking. The
      // series title is guaranteed stable across episodes.
      return `${slugifyTitle(name)}?s=${season}`;
    },
    getOverviewUrl() {
      const currentUrl = window.location.href;
      const origin = window.location.origin;
      if (currentUrl.includes('/video/')) {
        const videoPart = currentUrl.split('/video/')[1];
        const seriesId = videoPart ? videoPart.split('?')[0].split('/')[0] : undefined;
        if (seriesId) {
          return `${origin}/series/${seriesId}`;
        }
      }
      return currentUrl;
    },
    getEpisode() {
      return episode;
    },
    nextEpUrl() {
      return nextEp;
    },
  },
  init(page: any) {
    // eslint-disable-next-line no-void
    void api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    function tryExtractNextEpisodeFromAPI(data: any): void {
      try {
        const nextVideo = data && data.data && data.data[0];
        const attributes = nextVideo && nextVideo.attributes;
        if (!nextVideo || !attributes || attributes.videoType !== 'EPISODE') {
          return;
        }

        const included = data.included || [];
        const route = included.find(
          (item: any) => item.type === 'route' && item.attributes && item.attributes.canonical,
        );
        const routeUrl = route && route.attributes && route.attributes.url;
        if (routeUrl) {
          nextEp = `${window.location.origin}${routeUrl}`;
        }
      } catch (e) {
        // API interception is optional; not having a "next episode" link is not fatal.
      }
    }

    function extractFromDOM(): boolean {
      const titleElement = j.$(TITLE_SELECTOR);
      if (!titleElement.length) {
        return false;
      }

      name = titleElement.text().trim();

      const seasonEpisodeText = j.$(SEASON_EPISODE_SELECTOR).text().trim();
      const parsed = parseSeasonEpisodeText(seasonEpisodeText);

      if (parsed) {
        season = parsed.season;
        episode = parsed.episode;
      } else {
        // No season/episode info rendered for this title - treat it as a movie.
        season = 1;
        episode = 1;
      }

      return true;
    }

    function checkPage(): boolean {
      const url = window.location.href;
      let id: string | undefined;

      if (url.includes('/video/')) {
        // Format: /video/watch/{id}/{episodeId}
        const videoPart = url.split('/video/')[1];
        id = videoPart ? videoPart.split('?')[0].split('/')[0] : undefined;
      } else if (url.includes('/watch/')) {
        // Format: /watch/{id}
        const watchPart = url.split('/watch/')[1];
        id = watchPart ? watchPart.split('?')[0].split('/')[0] : undefined;
      }

      if (!id) {
        return false;
      }

      hboMaxId = id;

      if (!extractFromDOM()) {
        return false;
      }

      con.log(
        // eslint-disable-next-line max-len
        `HBOMax - Title: ${name}, Episode: ${episode}, Season: ${season}, ID: ${hboMaxId}`,
      );
      return true;
    }

    function startCheck() {
      // Reset state left over from a previous episode/navigation so stale
      // data can never leak into the next `checkPage()` call.
      nextEp = '';

      $('html').addClass('miniMAL-hide');

      if (!window.location.href.includes('/video/') && !window.location.href.includes('/watch/')) {
        return;
      }

      interceptFetch((url, response) => {
        if (!url.includes(API_URL_MATCH)) return;
        response
          .clone()
          .json()
          .then(data => tryExtractNextEpisodeFromAPI(data))
          .catch(() => {
            // Silent fail - the next episode link is a nice-to-have, not required for sync.
          });
      });

      utils.waitUntilTrue(
        function () {
          return j.$(TITLE_SELECTOR).length > 0;
        },
        function () {
          if (checkPage()) {
            page.handlePage();
          }
          $('html').removeClass('miniMAL-hide');
        },
      );
    }

    startCheck();

    utils.urlChangeDetect(function () {
      page.reset();
      startCheck();
    });
  },
};
