import { PageInterface } from '../../pageInterface';

export const voidScans: PageInterface = {
  name: 'VoidScans',
  domain: ['https://hivecomic.com', 'https://hivetoon.com', 'https://void-scans.com'],
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://hivecomic.com/*', '*://hivetoon.com/*', '*://void-scans.com/*'],
  },
  search: 'https://hivecomic.com/series?searchTerm={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('chapter[_-]').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().split('Chapter').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/series/<identifier>')
        .replace('<identifier>', $c.url().this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c.title().regex('chapter (\\d+)', 1).number().run(),
          $c.url().urlPart(5).regex('chapter[_-](\\d+)', 1).number().run(),
        )
        .ifNotReturn()
        .run();
    },
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
      return $c.url().this('sync.getIdentifier').run();
    },
    uiInjection($c) {
      return $c.querySelector('h1[itemprop="name"]').uiAfter().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .querySelector('h1')
        .text()
        .contains('erver error')
        .ifThen($c => $c.string('404').log().return().run())
        .detectURLChanges($c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
