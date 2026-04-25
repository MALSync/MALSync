import { PageInterface } from '../../pageInterface';

export const FalconScans: PageInterface = {
  name: 'FalconScans',
  domain: 'https://falconscans.com/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://falconscans.com/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(6).boolean().run(),
          $c.url().urlPart(5).matches('chapter').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('a[href^="/manga/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('overview.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href^="/manga/"]')
        .getAttribute('href')
        .urlAbsolute()
        .ifNotReturn()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(6).number().run();
    },
    readerConfig: [
      {
        current: {
          selector: '.w-full img.w-full',
          mode: 'countAbove',
        },
        total: {
          selector: '.w-full img.w-full',
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
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.text-3xl h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.\\@container\\/card-header').parent().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.z-10[data-slot="card-content"] .group').run();
    },
    elementEp($c) {
      return $c.find('h3').text().regex('(\\d+)', 1).number().run();
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
