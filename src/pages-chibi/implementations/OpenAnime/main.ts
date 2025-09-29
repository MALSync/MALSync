import { PageInterface } from '../../pageInterface';

export const OpenAnime: PageInterface = {
  name: 'OpenAnime',
  type: 'anime',
  domain: 'https://openani.me',
  languages: ['Turkish'],
  urls: {
    match: ['*://openani.me/*', '*://www.openani.me/*'],
  },
  search: 'https://openani.me/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(6).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.string('https://openani.me/anime/').concat($c.url().urlPart(4).run()).run();
    },
    getEpisode($c) {
      return $c.url().urlPart(6).number().run();
    },
    nextEpUrl($c) {
      return $c.boolean(false).run();
    },
    getMalUrl($c) {
      return $c.boolean(false).run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('anime').run(), $c.url().urlPart(5).boolean().not().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    uiInjection($c) {
      return $c.string('').run();
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
