import { PageInterface } from '../../pageInterface';

export const MangaDemon: PageInterface = {
  name: 'MangaDemon',
  domain: 'https://demonicscans.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://demonicscans.org/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('title').run();
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
      return $c.url().urlPart(6).number().run();
    },
    readerConfig: [
      {
        current: {
          selector: 'img.imgholder',
          mode: 'countAbove',
        },
        total: {
          selector: 'img.imgholder',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('manga').run();
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
      return $c.querySelector('h1').uiBefore().run();
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
