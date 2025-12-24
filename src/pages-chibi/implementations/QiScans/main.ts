import { PageInterface } from '../../pageInterface';

export const QiScans: PageInterface = {
  name: 'QiScans',
  domain: 'https://qiscans.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://qiscans.org/*'],
  },
  search: 'https://qiscans.org/series?searchTerm={searchtermPlus}',
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
      return $c.querySelector('h2').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('^\\d+-', '').trim().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
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
            .regex('chapter (\\d+)', 1)
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
        .querySelector('.lucide-chevron-right')
        .closest('a[href*="/chapter"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('.container img[tabindex]').countAbove().run(),
        total: $c => $c.querySelectorAll('.container img[tabindex]').length().run(),
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
      return $c.querySelector('.sticky > .space-y-2').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.grid .p-4').run();
    },
    elementUrl($c) {
      return $c.closest('a').ifNotReturn().getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('h3').text().regex('Chapter (\\d+)', 1).number().run();
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
        .detectChanges(
          $c.querySelector('.space-y-2 .grid').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
