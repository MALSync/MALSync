import { PageInterface } from '../../pageInterface';

export const DankefürsLesen: PageInterface = {
  name: 'DankefürsLesen',
  domain: 'https://danke.moe/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://danke.moe/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(4).equals('manga').run(), $c.url().urlPart(7).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1 a[href^="/read/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('h1 a[href^="/read/"]').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(6).regex('^(\\d+)', 1).number().run();
    },
    readerConfig: [
      {
        current: {
          selector: '.rdr-page-selector-counter',
          mode: 'text',
          regex: '(\\d+)/(\\d+)',
          group: 1,
        },
        total: {
          selector: '.rdr-page-selector-counter',
          mode: 'text',
          regex: '(\\d+)/(\\d+)',
          group: 2,
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(4).equals('manga').run(), $c.url().urlPart(6).boolean().not().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .getAttribute('content')
        .urlAbsolute()
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('article').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapterTable .table-default').run();
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
      return $c
        .url()
        .urlPart(7)
        .boolean()
        .ifThen($c => $c.detectChanges($c.url().urlPart(6).run(), $c.trigger().run()).run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
