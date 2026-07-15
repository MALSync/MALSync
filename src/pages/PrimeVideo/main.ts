import { pageInterface } from '../pageInterface';
import {
  interceptFetch,
  parseSeasonEpisodeText,
  slugifyTitle,
} from '../../utils/streamingProviderHelpers';

let episode = 1;
let season = 1;
let primeVideoId: string | undefined;
let name = '';
let nextEp = '';
let apiDataFetched = false;

const TITLE_SELECTOR = '.atvwebplayersdk-title-text';
const EPISODE_INFO_SELECTOR = '.atvwebplayersdk-episode-info';
// Prime Video's internal API used to enrich metadata beyond what the DOM exposes.
const API_URL_MATCH = 'cdp/lumina/playerChromeResources';

export const PrimeVideo: pageInterface = {
  name: 'PrimeVideo',
  domain: 'https://www.primevideo.com',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url: string) {
    // Prime Video can open the player either on its own /watch/ page or as a
    // modal on top of the /detail/ (overview) page.
    return url.includes('/watch/') || url.includes('/detail/');
  },
  sync: {
    getTitle() {
      return name;
    },
    getIdentifier() {
      // Deliberately title-based (not `primeVideoId`): Prime Video's /watch/
      // URL id is not confirmed to stay stable across episodes of the same
      // series, while the series title does. Using an unstable id here would
      // silently break episode progress tracking between episodes.
      return `${slugifyTitle(name)}?s=${season}`;
    },
    getOverviewUrl() {
      return `${PrimeVideo.domain}/detail/${primeVideoId}/`;
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

    function tryExtractFromAPI(data: any): boolean {
      try {
        const resources = data && data.resources;
        const catalog =
          resources && resources.catalogMetadataV2 && resources.catalogMetadataV2.catalog;
        if (!catalog || catalog.type !== 'EPISODE') {
          return false;
        }

        name = catalog.seriesTitle || name;
        episode = catalog.episodeNumber || 1;
        season = catalog.seasonNumber || 1;

        return true;
      } catch (e) {
        return false;
      }
    }

    function extractFromDOM(): boolean {
      const titleElement = j.$(TITLE_SELECTOR);
      if (!titleElement.length) {
        return false;
      }

      name = titleElement.text().trim();

      const episodeInfoText = j.$(EPISODE_INFO_SELECTOR).text().trim();
      const parsed = parseSeasonEpisodeText(episodeInfoText);

      if (parsed) {
        season = parsed.season;
        episode = parsed.episode;
      } else {
        // No episode info rendered for this title - treat it as a movie.
        season = 1;
        episode = 1;
      }

      return true;
    }

    function checkPage(): boolean {
      const urlParts = window.location.href.split('/');
      const watchIndex =
        urlParts.indexOf('watch') !== -1 ? urlParts.indexOf('watch') : urlParts.indexOf('detail');

      if (watchIndex === -1 || !urlParts[watchIndex + 1]) {
        return false;
      }

      primeVideoId = urlParts[watchIndex + 1];

      // Prefer data already captured from the API; otherwise fall back to DOM.
      if (!apiDataFetched && !extractFromDOM()) {
        return false;
      }

      nextEp = '';

      con.log(
        // eslint-disable-next-line max-len
        `PrimeVideo - Title: ${name}, Episode: ${episode}, Season: ${season}, ID: ${primeVideoId}`,
      );
      return true;
    }

    function startCheck() {
      // Reset state left over from a previous episode/navigation so stale
      // data can never leak into the next `checkPage()` call.
      apiDataFetched = false;
      nextEp = '';

      $('html').addClass('miniMAL-hide');

      interceptFetch((url, response) => {
        if (!url.includes(API_URL_MATCH)) return;
        response
          .clone()
          .json()
          .then(data => {
            apiDataFetched = tryExtractFromAPI(data);
          })
          .catch(() => {
            // API interception is optional; DOM extraction remains the fallback.
          });
      });

      utils.waitUntilTrue(
        function () {
          return j.$(TITLE_SELECTOR).length > 0 || apiDataFetched;
        },
        function () {
          if (checkPage()) {
            page.handlePage();
            $('html').removeClass('miniMAL-hide');
          }
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
