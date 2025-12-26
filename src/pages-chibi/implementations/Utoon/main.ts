import { PageInterface } from '../../pageInterface';

export const Utoon: PageInterface = {
  name: 'Utoon',
  domain: 'https://utoon.net',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://utoon.net/*'],
  },
  search:
    'https://utoon.net/?s={searchtermPlus}&post_type=wp-manga&op=&author=&artist=&release=&adult=',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('chapter[_-]?').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().split('Chapter').at(0).trim().replaceRegex('-$', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/manga/<identifier>')
        .replace('<identifier>', $c.url().this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('chapter[_-]?(\\d+)', 1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c.querySelector('.next_page').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        condition: '#single-pager',
        current: {
          selector: '#single-pager [selected="selected"]',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 1,
        },
        total: {
          selector: '#single-pager option',
          mode: 'text',
          regex: '(\\d+)/(\\d+)$',
          group: 2,
        },
      },
      {
        current: {
          selector: '.reading-content img',
          mode: 'countAbove',
        },
        total: {
          selector: '.reading-content img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
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
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.post-content').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.version-chap .wp-manga-chapter').run();
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
      return $c
        .if(
          $c.url().urlPart(5).boolean().run(),
          $c.detectChanges($c.url().urlPart(5).run(), $c.trigger().run()).run(),
          $c.run(),
        )
        .domReady()
        .trigger()
        .run();
    },
    syncIsReady($c) {
      // When clicking for prev/next chapter in page mode, it loading too slow causing the chapter sync to MAL without reading it yet
      return $c
        .waitUntilTrue($c.querySelector('.read-container .fa-spinner').isNil().run())
        .trigger()
        .run();
    },
  },
};
