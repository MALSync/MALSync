import { PageInterface } from '../../pageInterface';

export const LagoonScans: PageInterface = {
  name: 'LagoonScan',
  domain: 'https://lagoonscans.com/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://lagoonscans.com/*'],
  },
  search: 'https://lagoonscans.com/?s={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).matches('chapter').run(),
          $c.url().urlPart(4).boolean().not().run(),
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
      return $c.querySelector('.allc a').getAttribute('href').urlAbsolute().ifNotReturn().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(3).regex('chapter-?(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.ch-next-btn')
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
            .regex('(\\d+)/(\\d+)', 1)
            .number()
            .run(),
        total: $c =>
          $c.querySelector('#select-paged option').text().regex('(\\d+)/(\\d+)', 2).number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.querySelector('.entry-title').boolean().run(),
          $c.url().urlPart(3).equals('manga').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').getBaseText().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('.thumb img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.entry-content').uiPrepend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chbox').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
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
  },
};
