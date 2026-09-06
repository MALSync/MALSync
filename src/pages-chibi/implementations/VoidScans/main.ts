import { PageInterface } from '../../pageInterface';

export const voidScans: PageInterface = {
  name: 'VoidScans',
  domain: [
    'https://hivetoons.org',
    'https://hivecomic.com',
    'https://hivetoon.com',
    'https://void-scans.com',
  ],
  languages: ['English'],
  type: 'manga',
  urls: {
    match: [
      '*://hivetoons.org/*',
      '*://hivecomic.com/*',
      '*://hivetoon.com/*',
      '*://void-scans.com/*',
    ],
  },
  search: 'https://hivetoons.org/series?searchTerm={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
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
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/series/<identifier>')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c
            .url()
            .urlPart(5)
            .regex('chapter[_-](\\d+)', 1)
            .ifThen($c => $c.number().run())
            .run(),
          $c.title().regex('chapter (\\d+)', 1).run(),
        )
        .ifNotReturn()
        .number()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('.relative img[data-image-index]').countAbove().run(),
        total: $c => $c.querySelectorAll('.relative img[data-image-index]').length().run(),
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
      return $c.querySelectorAll('.space-y-1 a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
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
    listChange($c) {
      return $c
        .detectChanges($c.querySelector('.space-y-1').ifNotReturn().run(), $c.trigger().run())
        .run();
    },
  },
};
