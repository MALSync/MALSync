import { pageInterface } from '../pageInterface';

export const AnimeGO: pageInterface = {
  name: 'AnimeGO',
  languages: ['Russian'],
  domain: ['https://animego.org'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  getImage() {
    return j.$('.anime-poster img').attr('src');
  },
  sync: {
    getIdentifier(url) {
      // tvoe-imya-107 from https://animego.org/anime/tvoe-imya-107
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url; // Player & Anime info on same page
    },
    getTitle(url) {
      const jsonData = JSON.parse(j.$('script[type~="application/ld+json"]').text());
      con.m('Super Trace').info(jsonData.alternativeHeadline);
      return jsonData.alternativeHeadline[1]; // There're 3 languages there: Japanese, English, 日本語 (jp)
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
  // player/provider, dub, episode
  const elements = getAllActiveDivElementsPlayer();
  return {
    episode: elements[0].attr('data-episode'),
    player: elements[1].attr('data-provider'),
    dubbing: elements[2].attr('data-dubbing'),
  };
}

function getAllActiveDivElementsPlayer() {
  // Elements with class ".video-player__active": Active player, Active dub team, Active episode
  const epDiv = j.$('#video-carousel .video-player__active');
  const plDiv = j.$('#video-players .video-player__active');
  const dbDiv = j.$('#video-dubbing .video-player__active');

  return [epDiv, plDiv, dbDiv];
}
