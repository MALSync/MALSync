import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// urls can have a language prefix: /video/<show>/<episode> or /de/video/<show>/<episode>
function showPart($c: ChibiGenerator<unknown>) {
  return $c.url().regex('/video/([^/?#]+)', 1);
}

function hasEpisodePart($c: ChibiGenerator<unknown>) {
  return $c.url().matches('/video/[^/?#]+/[^/?#]+');
}

// "3533-episode-70", "23531-folge-6-wiedersehen"
function episodeFromSlug($c: ChibiGenerator<string>) {
  return $c
    .setVariable('episodeSlug')
    .matches('(?:episode|folge)-\\d+')
    .ifNotReturn()
    .getVariable<string>('episodeSlug')
    .regex('(?:episode|folge)-(\\d+)', 1);
}

const playerHeader = 'h1[data-testid="text"]';

// Selected season button, the episode page selects the season of the episode.
// The label depends on the site language ("Saison 3", "Staffel 3"), so only its shape is checked:
// one word and a number. Arcs ("Arc 05 : Greed Island") are no seasons.
function getSeason($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('[data-testid^="season-"][data-testid$="-selected"]')
    .ifNotReturn()
    .text()
    .trim()
    .setVariable('season')
    .matches('^(?:\\S+\\s+\\d+|\\d+\\.?\\s+\\S+)$')
    .ifNotReturn()
    .getVariable<string>('season')
    .regex('(\\d+)', 1)
    .number();
}

// every season is its own entry, "1034-oshi-no-ko?s=2"
function getIdentifier($c: ChibiGenerator<unknown>) {
  return $c
    .fn($c.exec(getSeason).run())
    .setVariable('season')
    .ifNotReturn($c.exec(showPart).run())
    .exec(showPart)
    .concat('?s=')
    .concat($c.getVariable<number>('season').string().run());
}

export const ADN: PageInterface = {
  name: 'ADN',
  type: 'anime',
  domain: 'https://animationdigitalnetwork.com',
  languages: ['French', 'German'],
  urls: {
    match: [
      '*://animationdigitalnetwork.com/*',
      '*://animationdigitalnetwork.fr/*',
      '*://animationdigitalnetwork.de/*',
    ],
  },
  search: 'https://animationdigitalnetwork.com/video?search={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.exec(hasEpisodePart).run();
    },
    getTitle($c) {
      return $c
        .querySelector(`${playerHeader} a[href*="/video/"]`)
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.exec(getIdentifier).run();
    },
    getOverviewUrl($c) {
      // the identifier is "<show>?s=<season>", which selects the season on the overview
      return $c.url().regex('^(.*?/video/)', 1).concat($c.exec(getIdentifier).run()).run();
    },
    getEpisode($c) {
      // movies and specials have no episode number
      return $c
        .url()
        .regex('/video/[^/?#]+/([^/?#]+)', 1)
        .exec(episodeFromSlug)
        .ifNotReturn($c.number(1).run())
        .number()
        .run();
    },
    getSeason($c) {
      return $c.exec(getSeason).run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[data-testid="cta"][rel="next"]')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().matches('/video/[^/?#]+').run(), $c.exec(hasEpisodePart).not().run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('[data-testid="default-layout"] h1')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.exec(getIdentifier).run();
    },
    getSeason($c) {
      return $c.exec(getSeason).run();
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
    uiInjection($c) {
      return $c.querySelector('[data-testid="show-tab"]').ifNotReturn().parent().uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll('[data-testid="show-videos"] a[data-testid="show-video-item"]')
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      // trailers ("bande-annonce") have no episode number
      return $c
        .getAttribute('href')
        .ifNotReturn($c.number(0).run())
        .exec(episodeFromSlug)
        .ifNotReturn($c.number(0).run())
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return (
        $c
          .detectURLChanges($c.trigger().run())
          // the season buttons of the overview only change the selected season
          .detectChanges(
            $c
              .querySelector('[data-testid^="season-"][data-testid$="-selected"]')
              .ifNotReturn()
              .getAttribute('data-testid')
              .run(),
            $c.trigger().run(),
          )
          .domReady()
          .trigger()
          .run()
      );
    },
    syncIsReady($c) {
      // the player header of the previous show stays until the new one is rendered
      return $c
        .waitUntilTrue(
          $c
            .querySelector(`${playerHeader} a[href*="/video/"]`)
            .ifNotReturn($c.boolean(false).run())
            .getAttribute('href')
            .contains($c.exec(showPart).run())
            .run(),
        )
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c
            .querySelector('a[data-testid="show-video-item"]')
            .ifNotReturn()
            .getAttribute('href')
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
