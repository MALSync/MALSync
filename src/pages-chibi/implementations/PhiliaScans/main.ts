import { PageInterface } from '../../pageInterface';

export const PhiliaScans: PageInterface = {
  name: 'PhiliaScans',
  domain: 'https://philiascans.org/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://philiascans.org/*'],
  },
  search: 'https://philiascans.org/?post_type=wp-manga&s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).matches('(\\d+)').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('.manga-title')
        .text()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.manga-title')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.fa-chevron-right')
        .closest('a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.page img',
          mode: 'countAbove',
        },
        total: {
          selector: '.page img',
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
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('.serie-title')
        .text()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.alternative-title').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.list-body-hh .item[data-chapter] a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .closest('.item[data-chapter]')
        .getAttribute('data-chapter')
        .regex('(\\d+)', 1)
        .number()
        .run(); // include locked chapter
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
