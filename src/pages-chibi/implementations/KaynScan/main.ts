import { PageInterface } from '../../pageInterface';

export const KaynScan: PageInterface = {
  name: 'KaynScan',
  domain: 'https://kaynscan.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://kaynscan.org/*'],
  },
  search: 'https://kaynscan.org/series/?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(5).contains('chapter').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('a[href*="/series/"] p.text-sm').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href*="/series/"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('a[href*="/series/"] h1')
        .text()
        .regex('chapter[ _-]?(\\d+)', 1)
        .number()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('[data-reader-page-image]').countAbove().run(),
        total: $c => $c.querySelectorAll('[data-reader-page-image]').length().run(),
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
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1[itemprop="name"]').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a[data-astro-prefetch]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.text-xs.font-medium').text().regex('chapter[ _-]?(\\d+)', 1).number().run();
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
