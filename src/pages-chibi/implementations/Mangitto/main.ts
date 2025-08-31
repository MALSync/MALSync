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
      return $c.querySelector('a.font-bold').ifNotReturn().text().string().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a.font-bold')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .string()
        .replaceRegex('/$', '')
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelectorAll('a.bg-mangitto-buttonGray[class*="flex-row-reverse"]')
        .filter($el => $el.text().trim().equals('Sonraki Bölüm').run())
        .ifNotReturn()
        .first()
        .getAttribute('href')
        .urlAbsolute()
        .string()
        .run();
    },
    getImage($c) {
      return $c
        .querySelector('img[alt="Manga Cover"]')
        .ifNotReturn()
        .getAttribute('src')
        .string()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '[data-page-number]',
          mode: 'countAbove',
        },
        total: {
          selector: '[data-page-number]',
          mode: 'count',
        },
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
        .querySelector('img[alt="Manga Cover"]')
        .ifNotReturn()
        .getAttribute('src')
        .string()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('div.grid.grid-cols-2 > div > a').run();
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
