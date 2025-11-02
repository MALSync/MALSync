import { PageInterface } from '../../pageInterface';

export const AnimeHeaven: PageInterface = {
  name: 'AnimeHeaven',
  type: 'anime',
  domain: 'https://animeheaven.me',
  languages: ['English'],
  urls: {
    match: ['*://animeheaven.me/*'],
  },
  search: 'https://animeheaven.me/search.php?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('gate.php').run();
    },
    getTitle($c) {
      return $c.querySelector('.c2.ac2').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.c2.ac2').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.querySelector('.linetitle3.c').text().split('Episode ').at(1).number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('anime.php').run();
    },
    getTitle($c) {
      return $c.querySelector('.infotitle.c').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().split('anime.php?').at(1).run();
    },
    uiInjection($c) {
      return $c.querySelector('.infoyear.c').uiAfter().run();
    },
    getImage($c) {
      return $c.querySelector('.posterimg').getAttribute('src').ifNotReturn(undefined).run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.trackep0').run();
    },
    elementEp($c) {
      return $c.find('.watch2').text().number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};
