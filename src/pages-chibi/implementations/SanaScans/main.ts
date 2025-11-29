import { PageInterface } from '../../pageInterface';

export const SanaScans: PageInterface = {
  name: 'SanaScans',
  domain: 'https://sanascan.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://sanascans.com/*'],
  },
  search: 'https://sanascans.com/series?searchTerm={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).matches('chapter[_-]?(\\d+)').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().split(' Chapter').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href*="/series/"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('(\\d+)$', 1).number().ifNotReturn().run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('.image-container img').countAbove().run(),
        total: $c => $c.querySelectorAll('.image-container img').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1[itemprop="name"]').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.space-y-2 .rounded-lg').run();
    },
    elementUrl($c) {
      return $c
        .find('img[alt]')
        .getAttribute('alt')
        .trim()
        .replaceRegex('^(.*?)(?=\\d+)', $c.url().concat('/chapter-').run())
        .urlAbsolute()
        .run();
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
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('.lucide-lock').isNil().run()).trigger().run();
    },
  },
};
