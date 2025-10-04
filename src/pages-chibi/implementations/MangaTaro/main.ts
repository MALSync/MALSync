import { PageInterface } from '../../pageInterface';

export const MangaTaro: PageInterface = {
  name: 'MangaTaro',
  domain: 'https://mangataro.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://mangataro.org/*'],
  },
  search: 'https://mangataro.org/?s={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('read').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('ch[_-]?').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('span.md\\:inline-block').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('.object-cover').getAttribute('src').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('a.space-x-2').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('ch[_-]?(\\d+)', 1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[title="Next Chapter"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        condition: '.comic-image-container[style*="display: none"]',
        current: {
          selector: '#currentPage',
          mode: 'text',
          regex: '(\\d+)',
          group: 1,
        },
        total: {
          selector: '#totalPages',
          mode: 'text',
          regex: '(\\d+)',
          group: 1,
        },
      },
      {
        current: {
          selector: '.pb-2 img',
          mode: 'countAbove',
        },
        total: {
          selector: '.pb-2 img',
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
      return $c.querySelector('.text-2xl').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.flex-1 .gap-1\\.5').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapter-list > a').run();
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
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};
