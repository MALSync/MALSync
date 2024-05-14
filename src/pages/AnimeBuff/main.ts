import { pageInterface } from '../pageInterface';

// const logger = con.m('AnimeBuff', '#dc2e44');

export const AnimeBuff: pageInterface = {
  name: 'AnimeBuff',
  languages: ['Russian'],
  domain: 'https://animebuff.ru',
  type: 'anime',
  isSyncPage(url) {
    // Not sync: https://animebuff.ru/anime/horimiya/recommendations and https://animebuff.ru/anime/horimiya/reviews
    if (utils.urlPart(url, 5) !== '') {
      return false;
    }
    // Catalog: https://animebuff.ru/anime/
    if (utils.urlPart(url, 4) === '') {
      return false;
    }
    // Handle 404 error
    if (j.$('.error-404').length > 0) {
      return false;
    }
    // slug must be last url part
    return true;
  },
  getImage() {
    return utils.absoluteLink(j.$('.anime__poster-img > img').attr('src'), AnimeBuff.domain);
  },
  sync: {
    getIdentifier(url) {
      // horimiya from  https://animebuff.ru/anime/horimiya
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return url; // Player & Anime info on same page
    },
    getTitle(url) {
      return j.$('.anime__other-names').text();
    },
    getEpisode(url) {
      return parseInt(j.$('.select-series-active').attr('data-series-number') || '1');
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

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
};

type PlayerActiveData = {
  episode: string | undefined;
  player: string | undefined;
  dubbing: string | undefined;
};

function getAllActiveElementsPlayer(): PlayerActiveData {
  const elements = getAllActiveDivElementsPlayer();
  return {
    episode: elements[0].attr('data-series-number'),
    player: elements[1].text(),
    dubbing: elements[2].attr('data-id'),
  };
}

function getAllActiveDivElementsPlayer() {
  const epDiv = j.$('.select-series-active'); // Episode
  const plDiv = j.$('.player-select[style="display: block;"]'); //  Player
  const dbDiv = j.$('.dub-select .ss-option-selected'); //  Dubbing

  return [epDiv, plDiv, dbDiv];
}
