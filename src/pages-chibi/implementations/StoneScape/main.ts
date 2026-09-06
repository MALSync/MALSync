import { PageInterface } from '../../pageInterface';

export const StoneScape: PageInterface = {
  name: 'StoneScape',
  domain: 'https://stonescape.xyz',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://stonescape.xyz/*'],
  },
  search:
    'https://stonescape.xyz/?s={searchtermPlus}&post_type=wp-manga&op=&author=&artist=&release=&adult=',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).matches('ch[_-]').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('[class*="navbar-title"]')
        .ifNotReturn()
        .text()
        .replaceLinebreaks()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/series/<identifier>')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('ch[_-](\\d+)', 1).number().run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('[class*="page-counter"]').boolean().run(),
        current: $c =>
          $c.querySelector('[class*="page-counter"]').text().regex('(\\d+)\\s*/', 1).number().run(),
        total: $c =>
          $c.querySelector('[class*="page-counter"]').text().regex('/\\s*(\\d+)', 1).number().run(),
      },
      {
        current: $c => $c.querySelectorAll('[class*="page-image"]').countAbove().run(),
        total: $c => $c.querySelectorAll('[class*="page-image"]').length().run(),
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
      return $c.querySelector('main h1').text().replaceLinebreaks().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('img[src*="covers"]')
        .ifNotReturn()
        .getAttribute('src')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('main h1').next().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[class*="chapter-grid"] a').run();
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
      return $c
        .waitUntilTrue($c.querySelector('[class*="chapter-grid"]').boolean().run())
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('[class*="chapter-grid"]').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
