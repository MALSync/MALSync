import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const WeebCentral: PageInterface = {
  name: 'WeebCentral',
  database: 'Weebcentral',
  domain: ['https://weebcentral.com'],
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://weebcentral.com/*'],
  },
  search: 'https://weebcentral.com/search?text={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('chapters').run();
    },
    getTitle($c) {
      return $c.querySelector('section.w-full a[href*="/series/"] span').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('section.w-full a[href*="/series/"]')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return getChapter(getChapterText($c)).run();
    },
    getVolume($c) {
      return getChapterText($c).regex('^s(\\d+)\\D', 1).ifNotReturn().number().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    nextEpUrl($c) {
      const regexText = 'nextPage\\(\\) {.*?(/chapters/[^"\'\\s]+).*?is_bookmarked\\(\\)';
      return $c
        .querySelectorAll('script[defer]')
        .arrayFind($el =>
          $el.text().replaceAll('/None', '').regex(regexText, 1, 'is').boolean().run(),
        )
        .ifNotReturn()
        .text()
        .regex(regexText, 1, 'is')
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        condition: $c =>
          $c.querySelector('button.col-span-2[\\@click="nextPage()"]').boolean().run(),
        current: $c =>
          $c
            .querySelector('[onclick*="page_select_modal"]')
            .text()
            .trim()
            .regex('\\d+$')
            .number()
            .run(),
        total: $c => $c.querySelectorAll('main img[src*="/manga/"]').length().run(),
      },
      {
        current: $c => $c.querySelectorAll('main img[src*="/manga/"]').countAbove().run(),
        total: $c => $c.querySelectorAll('main img[src*="/manga/"]').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('series').run();
    },
    getTitle($c) {
      return $c.querySelector('section h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('section h1.md\\:block').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapter-list a[href*="/chapters/"]').run();
    },
    elementUrl($c) {
      return $c.target().getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return getChapter($c.target().find('span > span').text().trim()).run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges($c.this('list.elementsSelector').length().run(), $c.trigger().run())
        .run();
    },
  },
};

function getChapterText($c: ChibiGenerator<any>) {
  return $c
    .querySelector('section.w-full button[hx-target="#chapter-select-body"] span')
    .text()
    .trim();
}

function getChapter($chapterText: ChibiGenerator<string>) {
  return $chapterText
    .setVariable('chapterText')
    .regex('(ch|chapter|episode|ep|chap|chp)\\D?(\\d+)', 2)
    .ifThen($c => $c.number().return().run())
    .getVariable('chapterText')
    .string()
    .regex('((\\d+\\.)?\\d+)$', 1)
    .ifNotReturn()
    .number();
}
