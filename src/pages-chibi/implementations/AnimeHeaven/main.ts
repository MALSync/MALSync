import { PageInterface } from 'src/pages-chibi/pageInterface';

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
      return $c.querySelector('.c2.ac2').getAttribute('href').ifNotReturn().split('?').slice(1,2).join('').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.c2.ac2').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.querySelector('.linetitle3.c').getBaseText().split(' ').slice(1,2).number().run();
    }
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).matches('anime\\.php\\?.*').run();
    },
    getTitle($c) {
      return $c.querySelector('.infotitle.c').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).split('?').slice(1,2).join('').run();
    },
    uiInjection($c) {
      return $c.querySelector('.infoyear.c').uiAfter().run();
    },
    getImage($c) {
      return $c.querySelector('.posterimg').getAttribute('src').ifNotReturn(undefined).run();
    }
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.linetitle2.c2 *').run();
    },
    elementEp($c) {
      return $c.querySelector('.watch2.bc').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectURLChanges($c.trigger().run())
        .waitUntilTrue($c.this('sync.getTitle').boolean().run()
          || $c.this('overview.getTitle').boolean().run())
        .trigger()
        .run();
    },
  },
};
