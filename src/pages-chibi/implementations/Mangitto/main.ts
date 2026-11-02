import { PageInterface } from '../../pageInterface';

export const Mangitto: PageInterface = {
  name: 'Mangitto',
  domain: ['https://mangtto.com'],
  languages: ['Turkish'],
  type: 'manga',
  urls: {
    match: ['*://*.mangtto.com/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('manga').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.title().regex('^(.+?)\\s+[\\d.]+\\. Bölüm', 1).ifNotReturn().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.string('/manga/').concat($c.url().urlPart(4).run()).urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('[data-page-number]').countAbove().run(),
        total: $c => $c.querySelectorAll('[data-page-number]').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelectorAll('h1')
        .filter($el => $el.text().trim().equals('Mangitto').not().run())
        .ifNotReturn()
        .first()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    uiInjection($c) {
      return $c.querySelector('main h1').uiAfter().run();
    },
    getImage($c) {
      return $c
        .querySelector('img[src*="/media/manga/cover/"]')
        .ifNotReturn()
        .getAttribute('src')
        .string()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll(
          $c.string('a[href^="/manga/').concat($c.url().urlPart(4).run()).concat('/"]').run(),
        )
        .filter($el => $el.getAttribute('href').urlPart(3).matches('^[\\d.]+$').run())
        .run();
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
        .domReady()
        .trigger()
        .detectChanges($c.url().urlStrip().run(), $c.trigger().run())
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.this('sync.getTitle').boolean().run())
        .trigger()
        .detectChanges($c.url().urlStrip().run(), $c.trigger().run())
        .run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.this('overview.getTitle').boolean().run()).trigger().run();
    },
  },
};
