import { PageInterface } from '../../pageInterface';

// Define constant for the repeated regex pattern
const CHAPTER_REGEX = '[Bb](?:ö|Ö)l(?:ü|Ü)m\\s*([\\d.]+)';

export const Sadscans: PageInterface = {
  name: 'Sadscans',
  domain: ['https://sadscans.net'],
  languages: ['Turkish'],
  type: 'manga',
  urls: {
    match: ['*://sadscans.net/*', '*://www.sadscans.net/*'],
  },
  search: 'https://sadscans.net/series?search={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('reader').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c
            .querySelector('meta[property="og:title"]')
            .ifNotReturn()
            .getAttribute('content')
            .split('Bölüm')
            .at(0)
            .trim()
            .run(),
          $c.title().split('Bölüm').at(0).trim().run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .coalesce(
          $c
            .this('sync.getIdentifier')
            .string()
            .replaceRegex('^', 'https://sadscans.net/series/')
            .run(),
          $c.url().urlAbsolute().string().replaceRegex('/reader/.*', '/series/').run(),
        )
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c
            .querySelector('meta[property="og:title"]')
            .ifNotReturn()
            .getAttribute('content')
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
        .coalesce(
          $c
            .querySelector(
              'a:contains("Sonraki"), a[href*="/reader/"]:has(svg.lucide-arrow-right), a[href*="/reader/"]:last-of-type',
            )
            .ifNotReturn()
            .getAttribute('href')
            .urlAbsolute()
            .run(),
        )
        .run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
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
          selector:
            'img[src*="assets/series"], img[src*="uploads/series"], .container img:not([src*="avatar"]):not([src*="logo"])',
          mode: 'countAbove',
        },
        total: {
          selector:
            'img[src*="assets/series"], img[src*="uploads/series"], .container img:not([src*="avatar"]):not([src*="logo"])',
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
      return $c
        .coalesce(
          $c.querySelector('h1').ifNotReturn().text().trim().run(),
          $c
            .querySelector('meta[property="og:title"]')
            .ifNotReturn()
            .getAttribute('content')
            .split('|')
            .at(0)
            .trim()
            .run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .ifNotReturn()
        .getAttribute('content')
        .urlAbsolute()
        .string()
        .replaceRegex('\\?.*$', '')
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a[href*="/reader/"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.text().regex(CHAPTER_REGEX, 1).number().ifNotReturn().run();
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
          $c.querySelector('a[href*="/reader/"]').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
