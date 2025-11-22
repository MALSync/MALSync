import { PageInterface } from '../../pageInterface';

export const Thunderscans: PageInterface = {
  name: 'Thunderscans',
  domain: 'https://en-thunderscans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://en-thunderscans.com/*'],
  },
  search: 'https://en-thunderscans.com/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).matches('chapter[_-]').run();
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
      return $c.url().urlPart(3).split('-chapter-').at(1).number().ifNotReturn().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.ch-next-btn:not(.disabled)')
        .ifNotReturn()
        .getAttribute('href')
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
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('comics').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('.thumb > img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapterlist .chbox').run();
    },
    elementUrl($c) {
      return $c.closest('a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.chapternum').text().regex('chapter\\s*(\\d+)', 1).number().run();
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
