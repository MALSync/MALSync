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
    return j.$('.entity__poster img').attr('src');
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
      return jsonData.alternateName || jsonData.name;
    },
    getEpisode(url) {
      return parseInt(j.$('.player-video-bar__series .active').attr('data-episode-number') || '1');
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
  console.log(j.$('.player-video__online'));
  if (j.$('.player-video__online').length === 1) return true;
  return false;
}

type PlayerActiveData = {
  episode: string | undefined;
  player: string | undefined;
  translation: string | undefined;
};

function getAllActiveDivElementsPlayer() {
  // Elements with class ".video-player__active"
  const epDiv = j.$('.player-video-bar__series .active'); // Episode
  const plDiv = j.$('#playerMenu #provider .active'); //  Player
  const trDiv = j.$('#playerMenu #translation .active'); //  Translation

  return [epDiv, plDiv, trDiv];
}

function getAllActiveElementsPlayer(): PlayerActiveData {
  const elements = getAllActiveDivElementsPlayer();
  return {
    episode: elements[0].attr('data-episode-number'),
    player: elements[1].attr('data-provider'),
    translation: elements[2].attr('data-translation'),
  };
}
