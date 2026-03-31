import { PageInterface } from '../../pageInterface';

export const AsuraScans: PageInterface = {
  name: 'AsuraScans',
  domain: 'https://asuracomic.net/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: [
      '*://asuracomic.net/*',
      '*://asuratoon.com/*',
      '*://asuracomics.com/*',
      '*://asura.gg/*',
      '*://asurascans.com/*',
      '*://asuratoon.com/*',
      '*://asuracomic.net/*',
      '*://asurascans.com/*',
    ],
  },
  search: 'https://asurascans.com/browse?q={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('comics').run(),
          $c.url().urlPart(6).boolean().run(),
          $c.url().urlPart(5).matches('chapter').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().replaceRegex('chapter.*', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('-[^-]+$', '').trim().run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(6).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('link[rel="next"]')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '[data-page]',
          mode: 'countAbove',
        },
        total: {
          selector: '[data-page]',
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
          $c.url().urlPart(3).equals('comics').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().replaceRegex('(-|\\|) ?asura.*', '').trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('article h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[opts*="ChapterListReact"] a[href*="chapter"]').run();
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
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('.text-card-foreground').isNil().run())
        .trigger()
        .run();
    },
  },
};
