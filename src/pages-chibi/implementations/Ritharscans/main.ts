import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// The ld+json holds a @graph, the page's main entity is the ComicIssue (reader) or ComicSeries (series page)
function getData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('script[type="application/ld+json"]')
    .ifNotReturn()
    .text()
    .jsonParse()
    .get('@graph')
    .ifNotReturn()
    .type<{ '@type': string }[]>()
    .arrayFind($item => $item.get('@type').string().matches('^Comic(Issue|Series)$').run());
}

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
        current: $c => $c.querySelector('[x-text="currentPage + 1"]').text().trim().number().run(),
        total: $c => $c.querySelector('[x-text="pages.length"]').text().trim().number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('series').run();
    },
    getTitle($c) {
      return $c.getGlobalVariable('data').get('name').string().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .run();
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
        .exec(getData)
        .setGlobalVariable('data')
        .detectURLChanges($c.exec(getData).setGlobalVariable('data').trigger().run())
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
