import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

function chapterPages($c: ChibiGenerator<unknown>) {
  return $c
    .string('.page-wrap[data-chapter-slug="')
    .concat($c.url().urlPart(5).run())
    .concat('"] .reader-page');
}

export const PhiliaScans: PageInterface = {
  name: 'PhiliaScans',
  domain: 'https://philiascans.org/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://philiascans.org/*'],
  },
  search: 'https://philiascans.org/all-mangas?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).matches('(\\d+)').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('a[title^="Back to"] .sr-only')
        .text()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[title^="Back to"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.fa-chevron-right')
        .closest('a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        // page mode: "1 / 31" or "16–17 / 33" for double pages
        condition: $c => $c.querySelector('.reader-h-counter').boolean().run(),
        current: $c =>
          $c.querySelector('.reader-h-counter').text().regex('(\\d+)\\s*/', 1).number().run(),
        total: $c =>
          $c.querySelector('.reader-h-counter').text().regex('/\\s*(\\d+)', 1).number().run(),
      },
      {
        // scroll mode, only count the current chapter (the next one gets appended)
        current: $c => $c.querySelectorAll($c.exec(chapterPages).run()).countAbove().run(),
        total: $c => $c.querySelectorAll($c.exec(chapterPages).run()).length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('.series-sticky-bar__title')
        .text()
        .replaceAll('\n', ' ')
        .replaceRegex('\\s+', ' ')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.detail-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#philia-chapters-list a.chapter-item').run();
    },
    elementUrl($c) {
      // hrefs are per-request tokens (/read/...), so build the chapter url
      return $c
        .find('.chapter-num')
        .text()
        .regex('(\\d[\\d.]*)', 1)
        .replaceAll('.', '-')
        .setVariable('chapterSlug')
        .string('/series/')
        .concat($c.url().urlPart(4).run())
        .concat('/chapter-')
        .concat($c.getVariable<string>('chapterSlug').run())
        .concat('/')
        .urlAbsolute()
        .run();
    },
    elementEp($c) {
      return $c.find('.chapter-num').text().regex('(\\d+)', 1).number().run(); // include locked chapter
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
