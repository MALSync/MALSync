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
    ],
  },
  search: 'https://asuracomic.net/series?page=1&name={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(6).boolean().run(),
          $c.url().urlPart(5).matches('chapter').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.text-sm a span').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('-[^-]+$', '').trim().run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.text-sm a').getAttribute('href').urlAbsolute().ifNotReturn().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(6).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.pl-4 .text-sm')
        .closest('a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.py-8 img',
          mode: 'countAbove',
        },
        total: {
          selector: '.py-8 img',
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
      return $c.title().split(' - Asura').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.gap-1.py-4').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.pr-2 .py-2').run();
    },
    elementUrl($c) {
      // url doesn't include '/series/' even after urlAbsolute
      return $c.find('a').getAttribute('href').replaceRegex('^', '/series/').urlAbsolute().run();
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
