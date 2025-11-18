import { PageInterface } from '../../pageInterface';

export const SetsuScans: PageInterface = {
  name: 'SetsuScans',
  domain: 'https://setsuscans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://setsuscans.com/*'],
  },
  search: 'https://setsuscans.com/?s={searchtermPlus}&post_type=wp-manga',
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
      return $c.querySelector('.breadcrumb a[href*="/manga/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.breadcrumb a[href*="/manga/"]')
        .getAttribute('href')
        .ifNotReturn()
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
        current: $c => $c.querySelectorAll('.reading-content img').countAbove().run(),
        total: $c => $c.querySelectorAll('.reading-content img').length().run(),
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
      return $c.querySelector('h1').getBaseText().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('.summary_image img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.tab-summary').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.wp-manga-chapter > a').run();
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
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('.version-chap').boolean().run()).trigger().run();
    },
  },
};
