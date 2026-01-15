import { PageInterface } from '../../pageInterface';

export const WitchScans: PageInterface = {
  name: 'WitchScans',
  domain: 'https://witchscans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://witchscans.com/*'],
  },
  search: 'https://witchscans.com/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().not().run(),
          $c.url().urlPart(3).matches('chapter[_-]?').run(),
        )
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
      return $c.url().urlPart(3).regex('chapter[_-]?(\\d+)', 1).number().ifNotReturn().run();
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
          selector: '#select-paged option:selected',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 1,
        },
        total: {
          selector: '#select-paged option',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 2,
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('manga').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.entry-title').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.entry-content').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapterlist .chbox').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
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
