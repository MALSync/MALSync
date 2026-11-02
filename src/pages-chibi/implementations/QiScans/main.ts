import { PageInterface } from '../../pageInterface';

export const QiScans: PageInterface = {
  name: 'QiScans',
  domain: 'https://qimanga.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://qiscans.org/*', '*://qimanhwa.com/*', '*://qimanga.com/*'],
  },
  search: 'https://qimanga.com/browse?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).matches('chapter[_-]').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('a.r-breadcrumb-link[href^="/series/"]')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('^\\d+-', '').trim().run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .setVariable('image')
        .contains('/logo/')
        .not()
        .ifNotReturn()
        .getVariable('image')
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href^="/series/"]:not([href*="/chapter"])')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c
            .title()
            .regex('(?:chapter|ch\\.) (\\d+)', 1, 'i')
            .ifThen($c => $c.number().run())
            .run(),
          $c.url().urlPart(5).regex('chapter[_-](\\d+)', 1).run(),
        )
        .ifNotReturn()
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[aria-label="Next chapter"][href*="/chapter"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: $c =>
          $c.querySelector('.r-page-counter').text().regex('(\\d+)\\s*/\\s*\\d+', 1).number().run(),
        total: $c =>
          $c.querySelector('.r-page-counter').text().regex('\\d+\\s*/\\s*(\\d+)', 1).number().run(),
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
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('[role="tablist"]').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a.cl-row').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.cl-num').ifNotReturn().text().regex('Chapter (\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .querySelector('h1')
        .text()
        .contains('Web server is returning an unknown')
        .ifThen($c => $c.string('404').log().return().run())
        .detectURLChanges($c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges($c.querySelector('.cl-list').ifNotReturn().text().run(), $c.trigger().run())
        .run();
    },
  },
};
