import { PageInterface } from '../../pageInterface';

// Example urls
// overview page url: https://anizm.net/ore-dake-level-up-na-ken-season-2-arise-from-the-shadow
// sync page url: https://anizm.net/ore-dake-level-up-na-ken-season-2-arise-from-the-shadow-12-bolum
// sync page url: https://anizm.net/ore-dake-level-up-na-ken-season-2-arise-from-the-shadow-12-bolum-izle

export const anizm: PageInterface = {
  name: 'Anizm',
  domain: 'https://anizm.net',
  languages: ['Turkish'],
  type: 'anime',
  urls: {
    match: ['*://anizm.net/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.querySelector('.episodeInfoContainer .animeIzleInnerContainer').boolean().run();
    },
    getTitle($c) {
      return $c
        .querySelector('.episodeContainer .info_otherTitle, .anizm_pageTitle a')
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.animeIzleBolumListesi a.animeDetayKutuLink')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      // plunderer-18-bolum -> "18" is the episode number
      // ghost-22-1-bolum -> "1" is the episode number
      // regexp will return the episode number in group 1
      // Regexp can be test it out in here https://regex101.com/r/VrbOgK/1
      return $c.url().regex('.*-(\\d{1,})-.*', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.anizm_alignRight a.anizm_button.default')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.querySelector('.animeDetayInnerContainer .animeDetayInfoWrapper').boolean().run();
    },
    getTitle($c) {
      return $c.querySelector('.anizm_pageTitle a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).run();
    },
    uiInjection($c) {
      return $c.querySelector('.infoExtraData ul.dataRows').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll('.episodeListTabContent .bolumKutucugu a, .animeEpisodesLongList > a')
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.log().this('list.elementUrl').log().this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
  },
};
