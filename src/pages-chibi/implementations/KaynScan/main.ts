import { PageInterface } from '../../pageInterface';

export const KaynScan: PageInterface = {
  name: 'KaynScan',
  domain: 'https://kaynscan.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://kaynscan.com/*'],
  },
  search: 'https://kaynscan.com/series/?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('chapter').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.opacity-100[alt]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.opacity-100[alt]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.opacity-100[alt]')
        .closest('span')
        .ifNotReturn()
        .text()
        .regex('chapter[ _-]?(\\d+)', 1)
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('img[src*="arrow-right"]')
        .closest('a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('#pages img').countAbove().run(),
        total: $c => $c.querySelectorAll('#pages img').length().run(),
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
      return $c.querySelector('h1').next().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapters a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('title').regex('chapter[ _-]?(\\d+)', 1).number().run();
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
      return $c.waitUntilTrue($c.querySelector('#pages_panel').boolean().run()).trigger().run(); // locked chapter
    },
  },
};
