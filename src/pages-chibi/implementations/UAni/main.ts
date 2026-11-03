import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// Class names are CSS modules with a build hash prefix (e.g. "_71RPCq_title"),
// so only their stable suffixes are matched.

const watchPath = '/anime/[^/]+-\\d+/watch/?$';
const readPath = '/manga/[^/]+-\\d+/read/\\d+/?$';
const overviewPath = '/(anime|manga)/[^/]+-\\d+/?$';
const listSelector = 'a[data-ep][href*="/seriya-"], a[class*="_chrow"][href*="/read/"]';

function isAnime($c: ChibiGenerator<unknown>) {
  return $c.url().urlStrip().urlPart(3).equals('anime');
}

function slugMatchesCanonical($c: ChibiGenerator<unknown>) {
  // After client side navigation the old page can stay rendered for a moment.
  return $c
    .querySelector('link[rel="canonical"]')
    .ifNotReturn($c.boolean(false).run())
    .getAttribute('href')
    .ifNotReturn($c.boolean(false).run())
    .urlStrip()
    .urlPart(4)
    .equals($c.url().urlStrip().urlPart(4).run());
}

export const UAni: PageInterface = {
  name: 'UAni',
  domain: 'https://uani.fun',
  languages: ['Ukrainian'],
  type: 'anime',
  computedType: $c => {
    return $c.if($c.exec(isAnime).run(), $c.string('anime').run(), $c.string('manga').run()).run();
  },
  urls: {
    match: ['*://uani.fun/*', '*://*.uani.fun/*'],
    player: {
      ashdi: ['*://*.ashdi.vip/*'],
      moonanime: ['*://*.moonanime.net/*'],
    },
  },
  search: {
    anime: 'https://uani.fun/anime?q={searchterm}',
    manga: null,
  },
  sync: {
    isSyncPage($c) {
      return $c
        .or(
          $c.url().urlStrip().matches(watchPath).run(),
          $c.url().urlStrip().matches(readPath).run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c
            .fn($c.querySelector('nav[class*="_back"] a span').ifNotReturn().text().trim().run())
            .run(),
          $c.fn($c.querySelector('[class*="_top__t"]').ifNotReturn().text().trim().run()).run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlStrip().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/')
        .concat($c.url().urlStrip().urlPart(3).run())
        .concat('/')
        .concat($c.url().urlStrip().urlPart(4).run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .if(
          $c.exec(isAnime).run(),
          // "/watch" without "ep" redirects to the first episode, so the heading is the fallback
          $c
            .coalesce(
              $c.fn($c.url().urlParam('ep').ifNotReturn().number().run()).run(),
              $c
                .fn(
                  $c.querySelector('#h-ep').ifNotReturn().text().regex('(\\d+)', 1).number().run(),
                )
                .run(),
            )
            .run(),
          // The visually hidden heading reads "<title>, розділ <number>"
          $c
            .querySelector('main h1')
            .ifNotReturn()
            .text()
            .regex('розділ\\s*(\\d+)', 1)
            .number()
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
        .run();
    },
    nextEpUrl($c) {
      return $c
        .if(
          $c.exec(isAnime).run(),
          $c
            .fn(
              $c
                .this('sync.getEpisode')
                .calculate('+', 1)
                .string()
                .setVariable('nextEp')
                // The episode matrix only has columns for released episodes
                .querySelector(
                  $c
                    .string('thead th[data-n="')
                    .concat($c.getVariable('nextEp').run())
                    .concat('"]')
                    .run(),
                )
                .ifNotReturn()
                .this('sync.getOverviewUrl')
                .concat('/watch?ep=')
                .concat($c.getVariable('nextEp').run())
                .run(),
            )
            .run(),
          $c
            .fn(
              $c
                .querySelector('a[class*="_nav--next"][href*="/read/"]')
                .ifNotReturn()
                .getAttribute('href')
                .urlAbsolute()
                .run(),
            )
            .run(),
        )
        .run();
    },
    readerConfig: [
      {
        // "стор. 6 з 11", shown in strip and paged mode
        current: $c =>
          $c
            .querySelector('p[class*="_pg"]')
            .ifNotReturn()
            .text()
            .regex('(\\d+)\\s*з\\s*\\d+', 1)
            .number()
            .run(),
        total: $c =>
          $c
            .querySelector('p[class*="_pg"]')
            .ifNotReturn()
            .text()
            .regex('\\d+\\s*з\\s*(\\d+)', 1)
            .number()
            .run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlStrip().matches(overviewPath).run();
    },
    getTitle($c) {
      // "English · Romaji" or "English · 원제"; the heading itself is Ukrainian
      return $c
        .coalesce(
          $c
            .fn(
              $c
                .querySelector('h1 ~ p[class*="_alt"]')
                .ifNotReturn()
                .text()
                .split(' · ')
                .first()
                .trim()
                .ifNotReturn()
                .run(),
            )
            .run(),
          $c.fn($c.querySelector('main h1').ifNotReturn().text().trim().run()).run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlStrip().urlPart(4).run();
    },
    uiInjection($c) {
      return $c.querySelector('h1 ~ p[class*="_meta"]').uiAfter().run();
    },
    getImage($c) {
      return $c
        .querySelector('img[class*="_poster"]')
        .ifNotReturn()
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll(listSelector).run();
    },
    elementUrl($c) {
      // Episode tiles link to an info page, the player is "/watch?ep=<n>"
      return $c
        .getAttribute('href')
        .replaceRegex('/seriya-(\\d+)$', '/watch?ep=$1')
        .urlAbsolute()
        .run();
    },
    elementEp($c) {
      return $c
        .if(
          $c.target().elementMatches('[data-ep]').run(),
          $c.target().getAttribute('data-ep').number().run(),
          $c
            .target()
            .find('[class*="_chrow__t"]')
            .ifNotReturn()
            .text()
            .regex('(\\d+)', 1)
            .number()
            .run(),
        )
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
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.exec(slugMatchesCanonical).run(),
              $c
                .if(
                  $c.exec(isAnime).run(),
                  $c.querySelector('#h-ep').boolean().run(),
                  // Page images live under /storage/manga/<manga id>/<chapter id>/
                  $c
                    .querySelector('figure[data-n] img')
                    .ifNotReturn($c.boolean(false).run())
                    .getAttribute('src')
                    .ifNotReturn($c.boolean(false).run())
                    .contains(
                      $c.string('/').concat($c.url().urlStrip().urlPart(6).run()).concat('/').run(),
                    )
                    .run(),
                )
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.exec(slugMatchesCanonical).run()).trigger().run();
    },
    listChange($c) {
      // Long chapter lists render more rows on demand
      return $c
        .detectChanges($c.querySelectorAll(listSelector).length().run(), $c.trigger().run())
        .run();
    },
  },
};
