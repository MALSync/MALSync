import { PageInterface } from '../../pageInterface';

export const Thunderscans: PageInterface = {
  name: 'Thunderscans',
  domain: 'https://en-thunderscans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://en-thunderscans.com/*'],
  },
  search: 'https://en-thunderscans.com/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).boolean().run(), $c.url().urlPart(3).matches('chapter[_-]').run())
        .run();
    },
    getTitle($c) {
      return $c.title().split(' Chapter').at(0).trim().replaceRegex('-$', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).split('-chapter-').at(0).trim().run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/comics/<identifier>')
        .replace('<identifier>', $c.url().this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce($c.url().urlPart(3).split('-chapter-').at(1).number().run())
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.ch-next-btn')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '#readerarea img',
          mode: 'countAbove',
        },
        total: {
          selector: '#readerarea img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('comics').run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h1')
        .text()
        .trim()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('.thumb > img').getAttribute('src').log().ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('ul > li > a .chbox').run();
    },
    elementUrl($c) {
      return $c.closest('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('h1').isNil().not().run()).trigger().run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('h1').isNil().not().run()).trigger().run();
    },
  },
};
