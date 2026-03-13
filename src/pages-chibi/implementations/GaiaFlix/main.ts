import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const GaiaFlix: PageInterface = {
  name: 'GaiaFlix',
  domain: 'https://gaiaflix.live',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://gaiaflix.live/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).matches('watch').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .url()
        .urlParam('title')
        .ifNotReturn()
        .concat($c.string(' ').run())
        .concat(getSeason($c).ifNotReturn().run())
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c
        .coalesce(
          $c.fn($c.url().urlParam('showId').ifNotReturn().run()).run(),
          $c.url().urlPart(4).run(),
        )
        .concat($c.string('-').concat(getSeason($c).ifNotReturn().run()).run())
        .slugify()
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/detail/')
        .concat($c.this('sync.getIdentifier').run())
        .replaceRegex('-.*', '')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlParam('e').number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.w-max button')
        .ifNotReturn()
        .url()
        .replaceRegex(
          'ep=\\d+',
          $c
            .string('ep=')
            .concat($c.this('sync.getEpisode').calculate('+', 1).string().run())
            .run(),
        )
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h3').uiBefore().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('detail').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('h1')
        .ifNotReturn()
        .text()
        .concat($c.string(' ').run())
        .concat(getSeason($c).run())
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('.object-cover').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.mt-10 a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectURLChanges($c.trigger().run())
        .detectChanges(getSeason($c).ifNotReturn().run(), $c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};

function getSeason($c: ChibiGenerator<unknown>) {
  return $c.coalesce(
    $c
      .fn(
        $c
          .querySelectorAll('.w-max button')
          .arrayFind($item => $item.elementMatches('.bg-background').not().run())
          .ifNotReturn()
          .text()
          .run(),
      )
      .run(),
    // fallback reason because it broke concat when it null
    $c.string(' ').run(),
  );
}
