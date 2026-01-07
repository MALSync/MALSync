import { PageInterface } from '../../pageInterface';

export const RageScans: PageInterface = {
  name: 'RageScans',
  domain: 'https://ragescans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://ragescans.com/*'],
  },
  search: 'https://ragescans.com/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().not().run(),
          $c.url().urlPart(3).matches('chapter[_-]?\\d+').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.allc a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.allc a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(3).regex('chapter[_-]?(\\d+)', 1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.ch-next-btn:not(.disabled)')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: $c =>
          $c
            .querySelector('#select-paged option:checked')
            .text()
            .regex('(\\d+)/(\\d+)$', 1)
            .number()
            .run(),
        total: $c =>
          $c.querySelector('#select-paged option').text().regex('(\\d+)/(\\d+)$', 2).number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('manga').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.info-desc').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapterlist .chbox').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.chapternum').text().regex('(\\d+)').number().run();
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
      // Can accidentally access locked chapter through chapter page
      return $c
        .waitUntilTrue($c.querySelector('.row .border-secondary').isNil().run())
        .trigger()
        .run();
    },
  },
};
