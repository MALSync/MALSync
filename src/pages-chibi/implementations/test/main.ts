import { PageInterface } from '../../pageInterface';

export const test: PageInterface = {
  name: 'Test',
  database: 'Test',
  domain: 'https://malsync.moe',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['https://malsync.moe/*'],
  },
  search: 'https://malsync.moe/search?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(0).equals('https:').run(),
          $c.url().urlPart(3).equals('pwa').not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.url().urlPart(2).run();
    },
    getIdentifier($c) {
      return $c.url().this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.url().run();
    },
    getEpisode($c) {
      return $c.url().number(3).run();
    },
    getVolume($c) {
      return $c.number(4).run();
    },
    nextEpUrl($c) {
      return $c.string('https://malsync.moe/next').run();
    },
    uiInjection($c) {
      return $c.querySelector('h1.card-title').uiAfter().run();
    },
    getMalUrl($c) {
      return $c.string('https://myanimelist.net/manga/1').run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('pwa').run();
    },
    getTitle($c) {
      return $c.url().urlPart(2).run();
    },
    getIdentifier($c) {
      return $c.string('Overview test').run();
    },
    uiInjection($c) {
      return $c.querySelector('h1.card-title').uiPrepend().run();
    },
    getMalUrl($c) {
      return $c.string('https://myanimelist.net/manga/1').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c
        .addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString())
        .run();
    },
    ready($c) {
      return $c
        .domReady()
        .detectChanges($c.querySelector('h1').text().run(), $c.trigger().run())
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelectorAll('.test-1').length().boolean().run())
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('.test-2').boolean().run()).trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges($c.querySelectorAll('.test-3').length().boolean().run(), $c.trigger().run())
        .run();
    },
  },
};
