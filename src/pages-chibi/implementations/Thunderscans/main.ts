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
      return $c.querySelector('.allc a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.allc a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(3).split('-chapter-').at(1).number().ifNotReturn().run();
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
        condition: '#select-paged',
        current: {
          selector: '#select-paged option:selected',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 1,
        },
        total: {
          selector: '#select-paged option:selected',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 2,
        },
      },
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
      return $c.querySelectorAll('#chapterlist .chbox').run();
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
  },
};
