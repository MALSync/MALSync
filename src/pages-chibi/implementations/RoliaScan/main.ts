import { PageInterface } from '../../pageInterface';

export const RoliaScan: PageInterface = {
  name: 'RoliaScan',
  domain: 'https://roliascan.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://roliascan.com/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(5).matches('chapter[_-]').run();
    },
    getTitle($c) {
      return $c.url().urlPart(4).replaceAll('-', ' ').run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.string('/manga/').concat($c.this('sync.getIdentifier').run()).urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('chapter[_-](\\d+)', 1).number().run();
    },
    readerConfig: [
      {
        current: {
          selector: '.manga-child-the-content img',
          mode: 'countAbove',
        },
        total: {
          selector: '.manga-child-the-content img',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c
            .url()
            .split('/')
            .length()
            .equals(5 + 1)
            .run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.url().urlPart(4).replaceAll('-', ' ').run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .title()
        .contains('Error 404')
        .ifThen($c => $c.string('404').log().return().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
