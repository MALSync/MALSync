import { PageInterface } from '../../pageInterface';

export const Kanae: PageInterface = {
  name: 'Kanae',
  type: 'anime',
  domain: 'https://kanae.to',
  languages: ['English'],
  urls: {
    match: ['*://kanae.to/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(5).equals('watch').run();
    },
    getTitle($c) {
      return $c.querySelector('nav a[href^="/series/"] span.truncate').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.string('/series/').concat($c.this('sync.getIdentifier').run()).urlAbsolute().run();
    },
    getEpisode($c) {
      return $c
        .querySelector('nav span.font-medium')
        .text()
        .trim()
        .regex('E(\\d+)', 1)
        .number()
        .run();
    },
    getImage($c) {
      return $c.querySelector('img[alt]:not([alt=""])').getAttribute('src').ifNotReturn().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('series').run(), $c.url().urlPart(5).boolean().not().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('img[alt]:not([alt=""])').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a.group.shrink-0').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.parent().find('p').text().regex('E(\\d+)', 1).number().run();
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
      return $c
        .waitUntilTrue($c.querySelector('nav a[href^="/series/"]').boolean().run())
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('h1').boolean().run()).trigger().run();
    },
  },
};
