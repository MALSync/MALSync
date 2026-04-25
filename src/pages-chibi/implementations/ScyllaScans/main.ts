import { PageInterface } from '../../pageInterface';

export const ScyllaScans: PageInterface = {
  name: 'ScyllaScans',
  domain: 'https://scyllacomics.xyz',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://scyllacomics.xyz/*'],
  },
  search: 'https://scyllacomics.xyz/manga?title={searchtermPlus}type=&status=',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('manga').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h3').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.text-xs a').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).ifNotReturn().number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.grid a')
        .next()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        condition: '#chapter-container img.hidden[data-id="0"]',
        current: {
          selector: '#chapter-container img.lazyloaded:not(.hidden):not([data-id="0"])',
          mode: 'attr',
          attribute: 'data-id',
          regex: '(\\d+)',
        },
        total: {
          selector: '#chapter-container img:last-of-type',
          mode: 'attr',
          attribute: 'data-id',
          regex: '(\\d+)',
        },
      },
      {
        current: {
          selector: '#chapter-container img',
          mode: 'countAbove',
        },
        total: {
          selector: '#chapter-container img',
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
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h2').text().split('[').at(0).trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.w-full .flex-col').next().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapters-list a > div').run();
    },
    elementUrl($c) {
      return $c.closest('a').getAttribute('href').urlAbsolute().run();
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
