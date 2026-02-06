/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/naming-convention, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports, global-require */
import { pageInterface } from '../pageInterface';
import { SITE_DOMAINS } from '../../config/siteDomains';
import type { SyncPage } from '../syncPage';

type PlayerActiveData = {
  episode: string | undefined;
  player: string | undefined;
  dubbing: string | undefined;
};

// Functions moved up to avoid 'used before defined' errors
function getAllActiveDivElementsPlayer() {
  // Elements with class ".video-player__active"
  const epDiv = j.$('#video-carousel .video-player__active'); // Episode
  const plDiv = j.$('#video-players .video-player__active'); //  Player
  const dbDiv = j.$('#video-dubbing .video-player__active'); //  Dubbing

  return [epDiv, plDiv, dbDiv];
}

function getAllActiveElementsPlayer(): PlayerActiveData {
  const elements = getAllActiveDivElementsPlayer();
  return {
    episode: elements[0].attr('data-episode'),
    player: elements[1].attr('data-provider'),
    dubbing: elements[2].attr('data-dubbing'),
  };
}

function isPlayerLoaded() {
  if (j.$('.video-player-main').length > 0) return true;
  return false;
}

export const AnimeGO: pageInterface = {
  name: 'AnimeGO',
  languages: ['Russian'],
  domain: [SITE_DOMAINS.animeGo.main], // Supports array or string, using array as original did
  type: 'anime',
  isSyncPage() {
    return true;
  },
  getImage() {
    return j.$('.anime-poster img').attr('src');
  },
  sync: {
    getIdentifier(url) {
      // tvoe-imya-107 from https://animego.me/anime/tvoe-imya-107
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url; // Player & Anime info on same page
    },
    getTitle() {
      const jsonData = JSON.parse(j.$('script[type~="application/ld+json"]').text()) as {
        name: string;
        alternativeHeadline: string[];
      };
      switch (jsonData.alternativeHeadline.length) {
        case 0: {
          // no headlines
          // example: https://animego.me/anime/moya-geroyskaya-akademiya-s1-294
          return jsonData.name; // Return Russian title, if no English found
        }
        case 3: {
          // Japanese, English, 日本語 (jp)
          // example: https://animego.me/anime/horimiya-1686
          return jsonData.alternativeHeadline[1];
        }
        default: {
          // 1 or 2. Anyway, English is first
          // examples:
          // 1: https://animego.me/anime/velikiy-pritvorschik-1573
          // 2: https://animego.me/anime/vanpanchmen-put-k-stanovleniyu-geroem-14
          return jsonData.alternativeHeadline[0];
        }
      }
    },
    getEpisode() {
      return parseInt(j.$('div#video-carousel .video-player__active').attr('data-episode') || '1');
    },
  },
  init(page: SyncPage) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    const styleSheet: {
      toString(): string;
    } = require('!to-string-loader!css-loader!less-loader!./style.less');
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    api.storage.addStyle(styleSheet.toString());
    utils.waitUntilTrue(
      isPlayerLoaded,
      () => {
        utils.changeDetect(
          () => {
            page.reset();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            page.handlePage();
          },
          () => {
            return JSON.stringify(getAllActiveElementsPlayer());
          },
          true,
        );
        utils.urlChangeDetect(() => {
          page.reset();
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          page.handlePage();
        });
      },
      500,
    );
  },
};
