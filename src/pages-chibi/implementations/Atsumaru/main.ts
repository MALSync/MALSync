import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

function slashCounter($c: ChibiGenerator<unknown>, selector: string, index: number) {
  return $c.querySelector(selector).ifNotReturn().text().split('/').at(index).trim();
}

// "Page 3 / 22" button of the page select
function pageCounter($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('select + button')
    .arrayFind($item => $item.text().matches('\\d+\\s*/\\s*\\d+').run())
    .ifNotReturn()
    .text();
}

function chapterId($c: ChibiGenerator<unknown>) {
  return $c.url().urlStrip().urlPart(5);
}

// page images of the current chapter
function chapterImages($c: ChibiGenerator<unknown>) {
  return $c.querySelectorAll(
    $c
      .string('img[src*="/static/pages/"][src*="/<chapterId>/"]')
      .replace('<chapterId>', $c.exec(chapterId).run())
      .run(),
  );
}

export function chapterLabelNumber($label: ChibiGenerator<string>) {
  return $label
    .setVariable('chapterLabel')
    .matches('(chapter|episode|chap|ch|ep)[^\\d]{0,3}\\d')
    .ifThen($c =>
      $c
        .getVariable('chapterLabel')
        .string()
        .regex('(chapter|episode|chap|ch|ep)[^\\d]{0,3}(\\d+(?:\\.\\d+)?)', 2)
        .number()
        .return()
        .run(),
    )
    .getVariable('chapterLabel')
    .string()
    .regex('(\\d+(?:\\.\\d+)?)', 1)
    .ifNotReturn()
    .number();
}

export const Atsumaru: PageInterface = {
  name: 'Atsumaru',
  domain: 'https://atsu.moe/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://atsu.moe/*'],
  },
  search: 'https://atsu.moe/explore?search={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('read').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('p.invisible').run(),
          $c.querySelector('.box-content a[href^="/manga/"]').run(),
        )
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/manga/<identifier>')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesceFn(
          slashCounter($c, 'span.relative:last-child', 0).run(),
          chapterLabelNumber(
            $c
              // chapter select, labeled "Page <chapter>", value is the chapter id
              .querySelectorAll('select')
              .arrayFind($item => $item.elementValue().equals($c.exec(chapterId).run()).run())
              .ifNotReturn()
              .selectedText()
              .trim(),
          ).run(),
          // "<title> - Chapter 131", the selects above are missing when the drawer shows the comments
          chapterLabelNumber($c.title().regex('.* - (.+)$', 1).ifNotReturn()).run(),
        )
        .number()
        .run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('.wrapper img').boolean().run(),
        current: $c => $c.querySelectorAll('.wrapper img').countAbove().run(),
        total: $c => $c.querySelectorAll('.wrapper img').length().run(),
      },
      {
        condition: $c => $c.exec(pageCounter).boolean().run(),
        current: $c => $c.exec(pageCounter).regex('(\\d+)\\s*/\\s*\\d+', 1).number().run(),
        total: $c => $c.exec(pageCounter).regex('\\d+\\s*/\\s*(\\d+)', 1).number().run(),
      },
      {
        // page mode without the page counter (drawer shows the comments), "#rs=p:<0-based page>"
        current: $c =>
          $c
            .url()
            .matches('#rs=(?:.*;)?p:\\d')
            .ifNotReturn($c.number(1).run())
            .url()
            .regex('#rs=(?:.*;)?p:(\\d+)', 1)
            .number()
            .calculate('+', 1)
            .run(),
        total: $c => $c.exec(chapterImages).length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .getAttribute('content')
        .urlAbsolute()
        .ifNotReturn()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector('a.btn[title="MyAnimeList"]')
            .ifNotReturn()
            .getAttribute('href')
            .urlAbsolute()
            .run(),
          anilistUrl: $c
            .querySelector('a.btn[title="AniList"]')
            .ifNotReturn()
            .getAttribute('href')
            .urlAbsolute()
            .run(),
          kitsuId: $c
            .querySelector('a.btn[title="Kitsu"]')
            .ifNotReturn()
            .getAttribute('href')
            // site using outdated .io domain
            .urlPart(4)
            .run(),
          mangabakaId: $c
            .querySelector('a.btn[title*="MangaBaka"]')
            .ifNotReturn()
            .getAttribute('href')
            .urlPart(3)
            .run(),
        })
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.md\\:block').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a[href^="/read/"].relative.rounded-sm').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .coalesce(
          $c
            .target()
            .closest('.shadow-sm')
            .findAll('.my-auto')
            .arrayFind($item => $item.text().matches('\\d+').run())
            .run(),
          $c.target().find('.truncate').run(),
        )
        .text()
        .regex('(\\d+(?:\\.\\d+)?)', 1)
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectChanges($c.exec(chapterId).run(), $c.trigger().run())
        .detectChanges($c.url().urlPart(4).run(), $c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('a[href^="/read/"].relative.rounded-sm').boolean().run())
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.flex-col.w-full').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
