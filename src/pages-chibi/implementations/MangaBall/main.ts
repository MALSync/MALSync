import { PageInterface } from '../../pageInterface';

export const MangaBall: PageInterface = {
  name: 'MangaBall',
  domain: 'https://mangaball.com',
  languages: ['Many'],
  type: 'manga',
  urls: {
    match: ['*://mangaball.com/*', '*://mangaball.net/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('chapter-detail').run();
    },
    getTitle($c) {
      return $c
        .querySelector('nav a[href*="/title-detail/"][title]')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('nav a[href*="/title-detail/"][title]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('h1')
        .text()
        .regex('(?:Ch(?:apter)?\\.?\\s*)(\\d+)', 1)
        .number()
        .ifNotReturn()
        .run();
    },
    getVolume($c) {
      return $c
        .querySelector('h1')
        .text()
        .regex('(?:Vol(?:ume)?\\.?\\s*)(\\d+)', 1)
        .number()
        .ifNotReturn()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('div.w-full.relative.group').countAbove().run(),
        total: $c => $c.querySelectorAll('div.w-full.relative.group').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('title-detail').run();
    },
    getTitle($c) {
      return $c.querySelector('main h1').text().trim().run();
    },
    getIdentifier($c) {
      // The title id, urls are "/title-detail/<id>", "/title-detail/<slug>-<id>" or "/title-detail/<id>-<slug>"
      return $c.url().urlPart(4).regex('[0-9a-f]{24}', 0).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('main h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      // One card per chapter, with a row per translation
      return $c.querySelectorAll('#chapter-section .space-y-2 > div').run();
    },
    elementUrl($c) {
      // Prefer the english translation, otherwise the first one
      return $c
        .find('a[title^="Read Ch."]:has(img[alt="English"])')
        .ifNotReturn(
          $c.target().find('a[title^="Read Ch."]').getAttribute('href').urlAbsolute().run(),
        )
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    elementEp($c) {
      return $c
        .find('a[title^="Read Ch."]')
        .getAttribute('title')
        .regex('Ch\\.\\s*(\\d+)', 1)
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('#chapter-section').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
