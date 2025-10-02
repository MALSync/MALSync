import { PageInterface } from '../../pageInterface';

export const FlameScans: PageInterface = {
  name: 'FlameScans',
  domain: 'https://flamecomics.xyz',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://flamecomics.com/*', '*://flamecomics.me/*', '*://flamecomics.xyz/*'],
  },
  search: 'https://flamecomics.xyz/browse?search={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('series').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('[class*="TopChapterNavbar_series_title"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.mantine-Grid-inner a').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c
        .querySelector('[class*="TopChapterNavbar_chapter_title"]')
        .text()
        .regex('Chapter[ _-]?(\\d+)', 1)
        .number()
        .ifNotReturn()
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.mantine-Stack-root img[width]',
          mode: 'countAbove',
        },
        total: {
          selector: '.mantine-Stack-root img[width]',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1.mantine-Title-root').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1.mantine-Title-root').next().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[class*="ChapterCard_chapterWrapper"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .find('.mantine-Text-root')
        .text()
        .trim()
        .regex('Chapter[ _-]?(\\d+)', 1)
        .number()
        .run();
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
