import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const ElfToon: PageInterface = {
  name: 'ElfToon',
  domain: 'https://elftoon.net',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://elftoon.net/*', '*://elftoon.com/*'],
  },
  search: 'https://elftoon.net/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(4).equals('comic').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(6).equals('chapter').run(),
          $c.url().urlPart(7).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[aria-label^="Back to"][href*="/series/comic/"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(7).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelectorAll('button')
        .arrayFind($el => $el.text().trim().matches('^Next\\s*Ch\\.').run())
        .ifNotReturn()
        .text()
        .regex('Ch\\.\\s*([\\d.]+)', 1)
        .ifNotReturn()
        .setVariable('nextChapter')
        .this('sync.getOverviewUrl')
        .concat('/chapter/')
        .concat($c.getVariable('nextChapter').run())
        .run();
    },
    readerConfig: [
      {
        // "Page by Page" mode: the indicator stays in the DOM even with "Show Page Number" off
        condition: $c => $c.querySelector('[data-page-indicator]').boolean().run(),
        current: $c =>
          $c
            .querySelector('[data-page-indicator] [data-page-current] .sr-only')
            .text()
            .trim()
            .number()
            .run(),
        total: $c =>
          $c.querySelectorAll('[data-page-indicator] .sr-only').last().text().trim().number().run(),
      },
      {
        // "Infinite" chapter flow: the next chapters are appended, so only count the pages of the current one
        condition: $c =>
          $c.querySelector('[data-page-number][data-chapter-number]').boolean().run(),
        current: $c => $c.exec(currentChapterPages).countAbove().run(),
        total: $c => $c.exec(currentChapterPages).length().run(),
      },
      {
        // "Vertical Scroll" mode: the page pill disappears with "Show Page Number" off, the pages do not
        current: $c => $c.querySelectorAll('[data-page-number]').countAbove().run(),
        total: $c => $c.querySelectorAll('[data-page-number]').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(4).equals('comic').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(6).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    getImage($c) {
      return $c
        .querySelector('.cursor-zoom-in img')
        .getAttribute('src')
        .ifNotReturn()
        .setVariable('coverSrc')
        .urlParam('url')
        .ifNotReturn($c.getVariable<string>('coverSrc').urlAbsolute().run())
        .replaceAll('%2F', '/')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('[class*="grid-area:tabs"]').uiPrepend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll('a[href*="/chapter/"]')
        .filter($el => $el.text().trim().matches('^Chapter\\s*[\\d.]+').run())
        .filter($el =>
          $el.getAttribute('href').contains($c.url().urlPart(5).concat('/chapter/').run()).run(),
        )
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').urlPart(7).number().run();
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

function currentChapterPages($c: ChibiGenerator<unknown>) {
  return $c.querySelectorAll(
    $c
      .string('[data-page-number][data-chapter-number="')
      .concat($c.url().urlPart(7).run())
      .concat('"]')
      .run(),
  );
}
