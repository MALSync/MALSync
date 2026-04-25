import { PageInterface } from '../../pageInterface';

export const LuaScans: PageInterface = {
  name: 'LuaScans',
  domain: 'https://luacomic.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://luacomic.org/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(5).boolean().run(), $c.url().urlPart(3).equals('series').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h2').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href*="/series/"]:not([href*="/chapter"])')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getImage($c) {
      return $c
        .querySelectorAll('[property="og:image"]')
        .last()
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('chapter-?(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.container > a[href*="/chapter"]')
        .next()
        .ifNotReturn()
        .getAttribute('href')
        .setVariable('nextEp')
        .matches('/chapter')
        .ifThen($c => $c.getVariable('nextEp').string().urlAbsolute().run())
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('.container img[data-src]').countAbove().run(),
        total: $c => $c.querySelectorAll('.container img[data-src]').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(4).matches('genre').boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.h-full > .text-muted-foreground').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.space-y-4 .justify-between > div').run();
    },
    elementUrl($c) {
      return $c.closest('a').ifNotReturn().getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.text-xs').text().regex('chapter\\s*(\\d+)', 1).number().run();
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
      return $c.waitUntilTrue($c.querySelector('h5').isNil().run()).trigger().run(); // locked chapter
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.space-y-4').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
