import { PageInterface } from '../../pageInterface';

export const templeScan: PageInterface = {
  name: 'TempleScan',
  domain: ['https://templetoons.com', 'https://templescan.net'],
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://templetoons.com/*', '*://templescan.net/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(5).matches('chapter-').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('.justify-center [href*="/comic/"]')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/comic/<identifier>')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c.title().regex('chapter (\\d+)', 1).number().run(),
          $c.url().urlPart(5).regex('chapter-(\\d+)', 1).number().run(),
        )
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('comic').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelectorAll('h1').at(1).text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelectorAll('h1').at(1).uiAfter().run();
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
