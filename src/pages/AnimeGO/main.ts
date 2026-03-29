import { pageInterface } from '../pageInterface';

export const AnimeGO: pageInterface = {
  name: 'AnimeGO',
  languages: ['Russian'],
  domain: ['https://animego.me'],
  type: 'anime',
  isSyncPage(url) {
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
    getTitle(url) {
      const jsonData = JSON.parse(j.$('script[type~="application/ld+json"]').text());
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
    getEpisode(url) {
      return parseInt(j.$('div#video-carousel .video-player__active').attr('data-episode') || '1');
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.waitUntilTrue(
      isPlayerLoaded,
      () => {
        utils.changeDetect(
          () => {
            page.reset();
            page.handlePage();
          },
          () => {
            return JSON.stringify(getAllActiveElementsPlayer());
          },
          true,
        );
        utils.urlChangeDetect(() => {
          page.reset();
          page.handlePage();
        });
      },
      500,
    );
  },
};

function isPlayerLoaded() {
  if (j.$('.video-player-main').length > 0) return true;
  return false;
}

type PlayerActiveData = {
  episode: string | undefined;
  player: string | undefined;
  dubbing: string | undefined;
};

function getAllActiveElementsPlayer(): PlayerActiveData {
  const elements = getAllActiveDivElementsPlayer();
  return {
    episode: elements[0].attr('data-episode'),
    player: elements[1].attr('data-provider'),
    dubbing: elements[2].attr('data-dubbing'),
  };
}

function getAllActiveDivElementsPlayer() {
  // Elements with class ".video-player__active"
  const epDiv = j.$('#video-carousel .video-player__active'); // Episode
  const plDiv = j.$('#video-players .video-player__active'); //  Player
  const dbDiv = j.$('#video-dubbing .video-player__active'); //  Dubbing

  return [epDiv, plDiv, dbDiv];
}
