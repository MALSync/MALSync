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
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('chapter[_-]').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().split('Chapter').at(0).trim().replaceRegex('-$', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/series/<identifier>')
        .replace('<identifier>', $c.url().this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c.title().regex('chapter (\\d+)', 1).number().run(),
          $c.url().urlPart(5).regex('chapter[_-](\\d+)', 1).number().run(),
        )
        .ifNotReturn()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.container img[tabindex]',
          mode: 'countAbove',
        },
        total: {
          selector: '.container img[tabindex]',
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
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h2')
        .text()
        .trim()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h2').uiAfter().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .querySelector('h2')
        .text()
        .contains('Server error')
        .ifThen($c => $c.string('404').log().return().run())
        .detectURLChanges($c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
