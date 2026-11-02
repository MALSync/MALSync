import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// Dragonroll writes exact catalogue ids on the page root and leaves them out when unsure.
function getMalUrl($c: ChibiGenerator<unknown>) {
  return $c.providerUrlUtility({
    malId: $c
      .querySelector('[data-title-slug][data-mal-id]')
      .ifNotReturn()
      .getAttribute('data-mal-id')
      .number()
      .run(),
    anilistId: $c
      .querySelector('[data-title-slug][data-anilist-id]')
      .ifNotReturn()
      .getAttribute('data-anilist-id')
      .number()
      .run(),
  });
}

export const Dragonroll: PageInterface = {
  name: 'Dragonroll',
  domain: ['https://www.dragonroll.to', 'https://www.dragonroll.tv'],
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://*.dragonroll.to/*', '*://*.dragonroll.tv/*'],
  },
  search: 'https://www.dragonroll.to/search?q={searchterm}',
  sync: {
    isSyncPage($c) {
      // /watch/<slug>/<episode id>; /watch/<slug>/episode/<number> only redirects there.
      return $c
        .and(
          $c.url().urlPart(3).equals('watch').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).equals('episode').not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#watch-title').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('#watch-title a').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.watch-page[data-episode-number]')
        .ifNotReturn()
        .getAttribute('data-episode-number')
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.watch-page[data-next-episode-href]')
        .ifNotReturn()
        .getAttribute('data-next-episode-href')
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c.exec(getMalUrl).run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('title').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#title-name').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    uiInjection($c) {
      return $c.querySelector('.title-hero__name-block').uiAfter().run();
    },
    getImage($c) {
      return $c
        .querySelector('.title-hero__poster img')
        .ifNotReturn()
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c.exec(getMalUrl).run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('li[data-episode-number]').run();
    },
    elementUrl($c) {
      return $c.find('a[href*="/watch/"]').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('data-episode-number').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      // The watch page rewrites its query (?language, ?server) in place, so only paths count.
      return $c
        .detectURLChanges($c.trigger().run(), { ignoreQuery: true, ignoreAnchor: true })
        .domReady()
        .trigger()
        .run();
    },
    syncIsReady($c) {
      // The previous episode stays on screen until the new one has loaded.
      return $c
        .waitUntilTrue(
          $c
            .querySelector('.watch-page[data-episode-id]')
            .ifNotReturn()
            .getAttribute('data-episode-id')
            .equals($c.url().urlPart(5).run())
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      // Switching seasons keeps the previous title on screen until the new one has loaded.
      return $c
        .waitUntilTrue(
          $c
            .querySelector('.title-page[data-title-slug]')
            .ifNotReturn()
            .getAttribute('data-title-slug')
            .equals($c.url().urlPart(4).run())
            .run(),
        )
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c
            .querySelector('li[data-episode-number]')
            .ifNotReturn()
            .getAttribute('data-episode-id')
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
