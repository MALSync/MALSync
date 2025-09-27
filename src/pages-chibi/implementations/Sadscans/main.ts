import { PageInterface } from '../../pageInterface';

// Define constant for the repeated regex pattern
const CHAPTER_REGEX = '[Bb](?:ö|Ö)l(?:ü|Ü)m\\s*([\\d.]+)';

export const Sadscans: PageInterface = {
  name: 'Sadscans',
  domain: ['https://sadscans.com'],
  languages: ['Turkish'],
  type: 'manga',
  urls: {
    match: ['*://sadscans.com/*', '*://www.sadscans.com/*'],
  },
  search: 'https://sadscans.com/series?search={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('reader').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('.series-title').ifNotReturn().text().trim().run(),
          $c.title().split('Bölüm').at(0).trim().run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.series-title')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .string()
        .replaceRegex('/$', '')
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c
            .querySelector('select.chap-select option[selected]')
            .ifNotReturn()
            .text()
            .regex(CHAPTER_REGEX, 1)
            .number()
            .run(),
          $c.title().regex(CHAPTER_REGEX, 1).number().run(),
        )
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a.next-chap[href*="/reader/"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .urlAbsolute()
        .string()
        .replaceRegex('\\?.*$', '')
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.swiper-wrapper img',
          mode: 'countAbove',
        },
        total: {
          selector: '.swiper-wrapper img',
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
      return $c.querySelector('.series-information .detail .title h2').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .coalesce(
          $c.querySelector('.series-image img').ifNotReturn().getAttribute('src').run(),
          $c.querySelector('[property="og:image"]').ifNotReturn().getAttribute('content').run(),
        )
        .ifNotReturn()
        .urlAbsolute()
        .string()
        .replaceRegex('\\?.*$', '')
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.series-information .detail .title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chap-section .chap').run();
    },
    elementUrl($c) {
      return $c.find('.chap-link .link a').ifNotReturn().getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .find('.chap-link .link a')
        .ifNotReturn()
        .text()
        .regex(CHAPTER_REGEX, 1)
        .number()
        .ifNotReturn()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .trigger()
        .detectChanges($c.url().urlStrip().run(), $c.trigger().run())
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.chap-section').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
