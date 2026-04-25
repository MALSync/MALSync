import { PageInterface } from '../../pageInterface';

export const DynastyScans: PageInterface = {
  name: 'DynastyScans',
  domain: 'https://dynasty-scans.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://dynasty-scans.com/*'],
  },
  search: 'https://dynasty-scans.com/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('chapters').run(),
          $c.url().urlPart(4).matches('_ch(\\d+)').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('#chapter-title > b > a').text().trim().run(),
          $c.querySelector('#chapter-title > b').text().trim().run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('[href*="/series/"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).regex('_ch(\\d+)', 1).number().run();
    },
    getVolume($c) {
      return $c
        .querySelector('#chapter-title b')
        .text()
        .regex('Volume (\\d+)', 1)
        .ifNotReturn()
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c.querySelector('#next_link').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelector('.pages-list .active').text().number().run(),
        total: $c => $c.querySelectorAll('.pages-list .page').last().text().number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('series').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h2.tag-title > b').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('.cover .thumbnail')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('div.row.cover-chapters').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('dl.chapter-list a[href*="/chapters/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
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
      return $c.domReady().trigger().run();
    },
  },
};
