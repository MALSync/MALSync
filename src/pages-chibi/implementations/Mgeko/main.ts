import { PageInterface } from '../../pageInterface';

export const Mgeko: PageInterface = {
  name: 'Mgeko',
  domain: 'https://www.mgeko.cc',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://www.mgeko.cc/*'],
  },
  search: 'https://www.mgeko.cc/search/?search={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(5).boolean().run(), $c.url().urlPart(3).equals('reader').run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h1 a')
        .text()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('h1 a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getImage($c) {
      return $c.this('overview.getImage').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('chapter-?(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.nextchap').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('#chapter-reader img[id]').countAbove().run(),
        total: $c => $c.querySelectorAll('#chapter-reader img[id]').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(5).boolean().not().run(), $c.url().urlPart(3).equals('manga').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.novel-tab-links').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapter-list .chapter-list-item').run();
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
