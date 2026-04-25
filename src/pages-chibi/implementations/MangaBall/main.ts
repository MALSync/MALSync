import { PageInterface } from '../../pageInterface';

export const MangaBall: PageInterface = {
  name: 'MangaBall',
  domain: 'https://mangaball.net',
  languages: ['Many'],
  type: 'manga',
  urls: {
    match: ['*://mangaball.net/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('chapter-detail').run();
    },
    getTitle($c) {
      return $c.querySelector('h6.mb-0').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.yoast-schema-graph')
        .html()
        .regex('url"\\s*:\\s*"[^"]*(\\/title-detail\\/[^"]+)', 1)
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('#chapterTitle')
        .text()
        .regex('(?:Ch(?:apter)?\\.?\\s*)(\\d+)', 1)
        .number()
        .ifNotReturn()
        .run();
    },
    getVolume($c) {
      return $c
        .querySelector('#chapterTitle')
        .text()
        .regex('(?:Vol(?:ume)?\\.?\\s*)(\\d+)', 1)
        .number()
        .ifNotReturn()
        .run();
    },
    readerConfig: [
      {
        current: {
          mode: 'text',
          selector: '#currentPageNum',
        },
        total: {
          mode: 'text',
          selector: '#totalPages',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('title-detail').run();
    },
    getTitle($c) {
      return $c.querySelector('.comic-title').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('-[^-]+$', '').trim().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.comic-detail-card .gap-3').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapter-block').run();
    },
    elementUrl($c) {
      // I tried to make elementUrl to default to english, and fallback to any language if there is no english
      return $c
        .find('.chapter-translation [class="badge"][style*="background:#00247d"]')
        .ifNotReturn(
          $c
            .target()
            .find('.btn-read')
            .getAttribute('onclick')
            .regex('\\/chapter-detail\\/[^\'"]+')
            .urlAbsolute()
            .run(),
        )
        .parent()
        .find('.btn-read')
        .getAttribute('onclick')
        .regex('\\/chapter-detail\\/[^\'"]+')
        .urlAbsolute()
        .run();
    },
    elementEp($c) {
      return $c.find('.chapter-number').text().regex('(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('#chaptersContainer').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
