import { PageInterface } from '../../pageInterface';

export const StoneScape: PageInterface = {
  name: 'StoneScape',
  domain: 'https://stonescape.xyz',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://stonescape.xyz/*'],
  },
  search: 'https://stonescape.xyz/?s={searchtermPlus}&post_type=wp-manga&op=&author=&artist=&release=&adult=',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('ch[_-]').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().split('Chapter').at(0).trim().replaceRegex(' • StoneScape', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
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
          $c.url().urlPart(5).regex('ch[_-](\\d+)', 1).number().run(),
        )
        .ifNotReturn()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.reading-content img',
          mode: 'countAbove',
        },
        total: {
          selector: '.reading-content img',
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
        .querySelector('h1')
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
      return $c.querySelector('#manga-chapters-holder > div').uiPrepend().run();
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
        .contains('Server error')
        .ifThen($c => $c.string('404').log().return().run())
        .detectURLChanges($c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
