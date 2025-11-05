import { PageInterface } from '../../pageInterface';

export const Ritharscans: PageInterface = {
  name: 'Ritharscans',
  domain: 'https://ritharscans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://ritharscans.com/*'],
  },
  search: 'https://ritharscans.com/search?title={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('read').run();
    },
    getTitle($c) {
      return $c.getGlobalVariable('data').get('isPartOf').get('name').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn($c.string('').run())
        .run();
    },
    getOverviewUrl($c) {
      return $c.getGlobalVariable('data').get('isPartOf').get('url').run();
    },
    getEpisode($c) {
      return $c
        .getGlobalVariable('data')
        .get('name')
        .string()
        .regex('^Chapter (\\d+)', 1)
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('div[x-init="initReader"]')
        .getAttribute('x-data')
        .regex("(?<=nextUrl:\\s*').*?(?=')")
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '[x-text="currentPage + 1"]',
          mode: 'text',
        },
        total: {
          selector: '[x-text="pages.length"]',
          mode: 'text',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('series').run();
    },
    getTitle($c) {
      return $c
        .getGlobalVariable('data')
        .get('name')
        .string()
        .regex('^(.*?)(?: \\[.+?\\])* - Ritharscans \\| \\w+$', 1)
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.getGlobalVariable('data').get('image').get('url').run();
    },
    uiInjection($c) {
      return $c.querySelector('div:has(> [title="Status"])').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapters a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('title').regex('Chapter (\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .querySelector('script[type="application/ld+json"]')
        .text()
        .jsonParse()
        .setGlobalVariable('data')
        .detectURLChanges(
          $c
            .querySelector('script[type="application/ld+json"]')
            .text()
            .jsonParse()
            .setGlobalVariable('data')
            .trigger()
            .run(),
        )
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('[x-text="pages.length"]').text().number().boolean().run())
        .trigger()
        .run();
    },
  },
};
