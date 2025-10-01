import { PageInterface } from '../../pageInterface';

export const VortexScans: PageInterface = {
  name: 'VortexScans',
  domain: 'https://vortexscans.org',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://vortexscans.org/*'],
  },
  search:
    'https://vortexscans.org/series?genre=&seriesType=&seriesStatus=&searchTerm={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('chapter[_-]?(\\d+)').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().split(' Chapter').at(0).trim().run();
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
      return $c.url().urlPart(5).regex('(\\d+)$', 1).number().ifNotReturn().run();
    },
    readerConfig: [
      {
        current: {
          selector: '.font-semibold img',
          mode: 'countAbove',
        },
        total: {
          selector: '.font-semibold img',
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
      return $c.querySelector('h1[itemprop="name"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1[itemprop="name"]').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.space-y-2 .rounded-lg').run();
    },
    elementUrl($c) {
      return $c
        .find('img[alt]')
        .getAttribute('alt')
        .trim()
        .replaceRegex('^(.*?)(?=\\d+)', $c.this('sync.getOverviewUrl').concat('/chapter-').run())
        .urlAbsolute()
        .run();
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
