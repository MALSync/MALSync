import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

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
      return slashCounter($c, 'span.relative:last-child', 0).number().run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('.wrapper img').boolean().run(),
        current: $c => $c.querySelectorAll('.wrapper img').countAbove().run(),
        total: $c => $c.querySelectorAll('.wrapper img').length().run(),
      },
      {
        current: $c => slashCounter($c, 'span.relative', 0).number().run(),
        total: $c => slashCounter($c, 'span.relative', 1).number().run(),
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
      return parseChapterLabel($c.target().find('span.truncate').text().trim()).run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectChanges($c.url().urlPart(5).run(), $c.trigger().run())
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

function slashCounter($c: ChibiGenerator<unknown>, selector: string, index: number) {
  return $c.querySelector(selector).ifNotReturn().text().split('/').at(index).trim();
}

function parseChapterLabel($label: ChibiGenerator<string>) {
  return $label
    .setVariable('chapterLabel')
    .regex('(ch|chapter|episode|ep|chap|chp|days)\\D?(\\d+(?:\\.\\d+)?)', 2)
    .ifThen($c => $c.number().return().run())
    .getVariable('chapterLabel')
    .string()
    .regex('((\\d+\\.)?\\d+)$', 1)
    .ifNotReturn()
    .number();
}
