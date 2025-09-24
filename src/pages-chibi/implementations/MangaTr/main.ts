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
      // Simplified pattern for sync page detection
      return $c
        .or(
          // Main URL structure
          $c.url().regex('id-\\d+-read-[\\w-]+-chapter-\\d+(?:\\.\\d+)?\\.html', 0).boolean().run(),
          // Fallback patterns
          $c.url().regex('reader/[^/]+', 0).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      // Simplified title extraction
      return $c
        .coalesce(
          // Main pattern
          $c.url().regex('id-\\d+-read-([\\w-]+)-chapter-\\d+(?:\\.\\d+)?\\.html', 1).run(),
          // Fallback for reader pattern
          $c.url().regex('reader/([^/]+)', 1).run(),
        )
        .run();
    },
    getIdentifier($c) {
      // Use same pattern as title
      return $c.this('sync.getTitle').run();
    },
    getOverviewUrl($c) {
      // Construct overview URL from manga name
      const mangaName = $c.this('sync.getTitle').run();
      return $c.string(`https://manga-tr.com/manga-${mangaName}.html`).run();
    },
    getEpisode($c) {
      // Simplified chapter number extraction
      return $c
        .coalesce(
          // Main pattern
          $c.url().regex('chapter-(\\d+(?:\\.\\d+)?)\\.html', 1).number().run(),
          // Fallback for reader pattern
          $c.url().regex('reader/[^/]+/(\\d+(?:\\.\\d+)?)', 1).number().run(),
        )
        .ifNotReturn()
        .run();
    },
    nextEpUrl($c) {
      // Simplified next chapter URL detection
      return $c
        .querySelector('a.next-chapter, a.next-btn, a[title*="Next"], a[title*="Sonraki"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getImage($c) {
      return $c
        .coalesce(
          $c
            .querySelector('[property="og:image"]')
            .ifNotReturn()
            .getAttribute('content')
            .urlAbsolute()
            .run(),
          $c
            .querySelector('.manga-image img, .cover img, .chapter-image img')
            .ifNotReturn()
            .getAttribute('src')
            .urlAbsolute()
            .run(),
        )
        .run();
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
      // Simplified pattern for overview page detection
      return $c.url().regex('manga-[^.]+\\.html', 0).boolean().run();
    },
    getTitle($c) {
      // Simplified title extraction
      return $c
        .querySelector('h1.manga-title, h1.series-title, h1')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      // Extract manga name from URL
      return $c.url().regex('manga-([^.]+)\\.html', 1).run();
    },
    getImage($c) {
      return $c
        .coalesce(
          $c.querySelector('[property="og:image"]').ifNotReturn().getAttribute('content').run(),
          $c.querySelector('.manga-image img, .cover img').ifNotReturn().getAttribute('src').run(),
        )
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.manga-info, .series-info, h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      // Simplified selector for chapter list
      return $c.querySelectorAll('.chapter-list a, .chapters li a, .chapter-item a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      // Simplified chapter number extraction
      return $c
        .coalesce(
          $c.text().regex('Chapter\\s*(\\d+(?:\\.\\d+)?)', 1).number().run(),
          $c.text().regex('Bölüm\\s*(\\d+(?:\\.\\d+)?)', 1).number().run(),
          $c.getAttribute('href').regex('chapter-(\\d+(?:\\.\\d+)?)\\.html', 1).number().run(),
        )
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
    syncIsReady($c) {
      return $c.waitUntilTrue($c.this('sync.getTitle').boolean().run()).trigger().run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.this('overview.getTitle').boolean().run()).trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.chapter-list, .chapters').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
