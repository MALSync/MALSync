import { PageInterface } from '../../pageInterface';

export const anicrush: PageInterface = {
  name: 'Anicrush',
  type: 'anime',
  domain: 'https://anicrush.to',
  languages: ['English'],
  urls: {
    match: ['*://anicrush.to/*'],
  },
  search: 'https://anicrush.to/search?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('watch').run();
    },
    getTitle($c) {
      return $c.querySelector('div.main h2').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).ifNotReturn().split('.').last().run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('div.other-items a').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlParam('ep').number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('detail').run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    uiInjection($c) {
      return $c.querySelector('div.main div.other-items').uiAfter().run();
    },
  },
  lifecycle: {
    setup($c) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('div.main h2').boolean().run()).trigger().run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('div.main h2').boolean().run()).trigger().run();
    },
  },
};
