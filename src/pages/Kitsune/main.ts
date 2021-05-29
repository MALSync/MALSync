import { pageInterface } from '../pageInterface';
import { aniListToMal } from '../../_provider/AniList/helper';

// WATCH_SYNC contents
type KitsuneWatchSyncData = {
  anilistId: number;
  anime_id: string;
  episode: string;
  episode_id: string;
  name: string;
  page: string;
  seriesUrl: string;
};

let jsonData: KitsuneWatchSyncData;

export const Kitsune: pageInterface = {
  name: 'Kitsune',
  domain: ['https://beta.kitsune.tv', 'https://kitsune.tv'],
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    return jsonData.page === 'episode/watch';
  },
  // isOverviewPage(url) {
  //   return jsonData.page === 'series/overview';
  // },
  sync: {
    getTitle(url) {
      return jsonData.name;
    },
    getIdentifier(url) {
      return jsonData.anime_id;
    },
    getOverviewUrl(url) {
      return jsonData.seriesUrl;
    },
    getEpisode(url) {
      return parseInt(jsonData.episode) || 0;
    },
    nextEpUrl(url) {
      return j
        .$('.episodes-list a.active')
        .parents('div')
        .next()
        .find('a')
        .attr('href');
    },
    async getMalUrl(provider) {
      try {
        const malId = await aniListToMal(jsonData.anilistId, 'anime');
        return `https://myanimelist.net/anime/${malId}`;
      } catch (e) {
        // do nothing
      }
      if (provider === 'ANILIST') return `https://anilist.co/anime/${jsonData.anilistId}`;
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return '';
    },
    getIdentifier(url) {
      return '';
    },
    uiSelector(selector) {
      // No UI
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.episodes-list > a');
      },
      elementUrl(selector) {
        return selector.attr('href') || '';
      },
      elementEp(selector) {
        return Number(utils.getBaseText($(selector)));
      },
    },
  },
  init(page) {
    let interval;

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    });

    function check() {
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          const elem = j.$('#sync-info');
          if (elem.length && elem.text()) {
            jsonData = JSON.parse(elem.text());
            return true;
          }
          return false;
        },
        function() {
          page.handlePage();
        },
      );
    }
  },
};
