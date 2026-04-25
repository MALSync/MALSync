import { PageInterface } from '../../pageInterface';

export const StoneScape: PageInterface = {
  name: 'StoneScape',
  domain: 'https://stonescape.xyz',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://stonescape.xyz/*'],
  },
  search:
    'https://stonescape.xyz/?s={searchtermPlus}&post_type=wp-manga&op=&author=&artist=&release=&adult=',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).matches('ch[_-]').run(),
        )
        .run();
    },
    getTitle($c) {
      const filter = $f =>
        $f.getAttribute('href').contains($c.this('sync.getIdentifier').run()).run();
      return $c
        .coalesce(
          $c.querySelectorAll('.breadcrumb a').arrayFind(filter).text().run(),
          $c.title().split('Chapter').at(0).run(),
        )
        .replaceRegex(' • StoneScape', '')
        .replaceLinebreaks()
        .trim()
        .run();
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
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce($c.url().urlPart(5).regex('ch[_-](\\d+)', 1).number().run())
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      return $c.querySelector('a.next_page').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('#single-pager').boolean().run(),
        current: $c =>
          $c.querySelector('#single-pager [selected]').text().regex('(\\d+)/', 1).number().run(),
        total: $c =>
          $c.querySelector('#single-pager option').text().regex('/(\\d+)', 1).number().run(),
      },
      {
        current: $c => $c.querySelectorAll('.reading-content img').countAbove().run(),
        total: $c => $c.querySelectorAll('.reading-content img').length().run(),
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
      return $c.querySelector('h1').text().replaceLinebreaks().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.page-content-listing').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.listing-chapters_wrap .wp-manga-chapter').run();
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
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('#manga-chapters-holder').find('div').isNil().not().run())
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('#manga-reading-nav-head').isNil().not().run())
        .trigger()
        .run();
    },
  },
};
