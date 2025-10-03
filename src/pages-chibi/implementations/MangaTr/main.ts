import { PageInterface } from '../../pageInterface';

export const MangaTr: PageInterface = {
  name: 'MangaTr',
  domain: ['https://manga-tr.com'],
  languages: ['Turkish'],
  type: 'manga',
  urls: {
    match: ['*://manga-tr.com/*'],
  },
  search: 'https://manga-tr.com/search?query={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .or(
          $c
            .url()
            .regex(String.raw`id-\d+-read-[\w-]+-chapter-\d+(?:\.\d+)?\.html`, 0)
            .boolean()
            .run(),
          $c.url().regex('reader/[^/]+', 0).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c
            .url()
            .regex(String.raw`id-\d+-read-([\w-]+)-chapter-\d+(?:\.\d+)?\.html`, 1)
            .run(),
          $c.url().regex('reader/([^/]+)', 1).run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getTitle').run();
    },
    getOverviewUrl($c) {
      return $c
        .string('https://manga-tr.com/manga-')
        .concat($c.this('sync.getTitle').run())
        .concat('.html')
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c
            .url()
            .regex(String.raw`chapter-(\d+(?:\.\d+)?)\.html`, 1)
            .number()
            .run(),
          $c
            .url()
            .regex(String.raw`reader/[^/]+/(\d+(?:\.\d+)?)`, 1)
            .number()
            .run(),
        )
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a.next-chapter, a.next-btn, a[title*="Next"], a[title*="Sonraki"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    readerConfig: [
      {
        current: {
          selector: '.chapter-container img, .reader img, .manga-reader img, .page-container img',
          mode: 'countAbove',
        },
        total: {
          selector: '.chapter-container img, .reader img, .manga-reader img, .page-container img',
          mode: 'count',
        },
      },
    ],
    uiInjection($c) {
      return $c
        .querySelector('.reader-controls, .chapter-info, .navigation, .reader-header')
        .ifNotReturn()
        .uiAfter()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .url()
        .regex(String.raw`manga-[^.]+\.html`, 0)
        .boolean()
        .run();
    },
    getTitle($c) {
      // Get the title as a ChibiJson object
      const titleObj = $c
        .coalesce(
          $c.querySelector('[property="og:title"]').ifNotReturn().getAttribute('content').run(),
          $c.title().run(),
          $c.querySelector('h1.manga-title, h1.series-title, h1').ifNotReturn().text().run(),
        )
        .trim();

      // Process the title with regex replacements
      return titleObj
        .replaceRegex(String.raw`[ \t\n\r\f\v]*[-|][ \t\n\r\f\v]*MangaTR.*$`, '')
        .replaceRegex(String.raw`[ \t\n\r\f\v]*Manga Oku.*$`, '')
        .replaceRegex(
          String.raw`[ \t\n\r\f\v]*-(?:[\u00C7C]evrimi[\u00E7c]i\s+T(?:\u00FC|u)rk(?:\u00E7|c)e\s+Manga|T(?:\u00FC|u)rk(?:\u00E7|c)e\s+Manga|.*[Cc]evrimi[cç]i.*T[uü]rk[cç]e.*Manga|.*[Çç]evrimi[cç]i.*T[uü]rk[cç]e.*Manga|.*[Çç]evrimi[cç]i.*T[uü]rk[cç]e.*Manga.*|.*Ã‡evrimiÃ§i.*TÃ¼rkÃ§e.*Manga).*`,
          '',
        )
        .replaceRegex(String.raw`[ \t\n\r\f\v]*\([0-9]{4}\)[ \t\n\r\f\v]*$`, '')
        .replaceRegex(String.raw`^([^ :]+)[ \t\n\r\f\v]+(Two.*)$`, '$1: $2')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c
        .url()
        .regex(String.raw`manga-([^.]+)\.html`, 1)
        .run();
    },
    getImage($c) {
      return $c.string('').run();
    },
    uiInjection($c) {
      return $c.querySelector('.manga-info, .series-info, h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      // For chapter loading, we'll rely on existing DOM elements
      // since we can't use XMLHttpRequest in ChibiScript

      return $c
        .querySelectorAll(
          'a[href*="id-"][href*="chapter-"], .chapter-list a, .chapters li a, .chapter-item a, .chapter-table a, .chapter-grid a',
        )
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.target().this('list.elementUrl').this('sync.getEpisode').run();
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
          $c.querySelector('#results, .chapter-list, .chapters').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
