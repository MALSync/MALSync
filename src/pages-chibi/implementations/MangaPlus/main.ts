import { PageInterface } from '../../pageInterface';

export const MangaPlus: PageInterface = {
  name: 'MangaPlus',
  domain: 'https://mangaplus.shueisha.co.jp',
  languages: [
    'English',
    'Spanish',
    'Thai',
    'Portuguese',
    'Indonesian',
    'Russian',
    'French',
    'German',
    'Vietnamese',
  ],
  type: 'manga',
  urls: {
    match: ['*://mangaplus.shueisha.co.jp/*'],
  },
  search: 'https://mangaplus.shueisha.co.jp/search_result?keyword={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('viewer').run();
    },
    getTitle($c) {
      return $c.querySelector('h1.Navigation-module_title_180OT').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('h1.Navigation-module_title_180OT')
        .parent()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('p.Navigation-module_chapterTitle_20juD')
        .text()
        .regex('(\\d+)', 1)
        .number()
        .ifNotReturn()
        .run();
    },
    readerConfig: [
      {
        current: {
          mode: 'text',
          selector: '[class*="Viewer-module_pageNumber"]',
          regex: '(\\d+) /',
          group: 1,
        },
        total: {
          mode: 'text',
          selector: '[class*="Viewer-module_pageNumber"]',
          regex: '/ (\\d+)',
          group: 1,
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('titles').run();
    },
    getTitle($c) {
      return $c.querySelector('h1.TitleDetailHeader-module_title_Iy33M').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('[class*="TitleDetailHeader-module_coverImage"]')
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c
        .querySelector('[class*="TitleDetailHeader-module_overviewTitleWrapper"]')
        .uiAfter()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[class*="ChapterListItem-module_chapterListItem"]').run();
    },
    elementEp($c) {
      return $c
        .find('[class*="ChapterListItem-module_name"]')
        .text()
        .regex('(\\d+)', 1)
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
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('[class*="TitleDetail-module_loading"]').isNil().run())
        .trigger()
        .run();
    },
  },
};
