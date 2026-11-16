import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// Links and urls switch between romaji and english slugs depending on the user setting.
// The canonical url always uses the romaji slug.
function canonical($c: ChibiGenerator<unknown>) {
  return $c.querySelector('link[rel="canonical"]').ifNotReturn().getAttribute('href').ifNotReturn();
}

function romajiTitle($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('[data-anime-title][data-title-romaji]')
    .ifNotReturn()
    .getAttribute('data-title-romaji')
    .ifNotReturn()
    .trim();
}

export const AnimeKO: PageInterface = {
  name: 'AnimeKO',
  type: 'anime',
  domain: 'https://animeko.ws',
  languages: ['French'],
  urls: {
    match: ['*://animeko.ws/*', '*://animeko.co/*'],
  },
  search: 'https://animeko.ws/animes?search={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlStrip().matches('/[^/]+-episode-\\d+[^/]*$').run();
    },
    getTitle($c) {
      return $c.exec(romajiTitle).run();
    },
    getIdentifier($c) {
      // ".../tsuihou-sareta-...-musou-suru-episode-01-vostfr"
      return $c.exec(canonical).regex('/([^/]+)-episode-\\d+', 1).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/anime/<identifier>')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.exec(canonical).regex('-episode-(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelectorAll('a[data-anime-link]')
        .arrayFind($item => $item.text().contains('SUIVANT').run())
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector('a[href*="myanimelist.net/anime/"]')
            .ifNotReturn()
            .getAttribute('href')
            .run(),
        })
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('anime').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.exec(romajiTitle).run();
    },
    getIdentifier($c) {
      return $c.exec(canonical).urlPart(4).run();
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
      return $c.querySelector('h1.hero-title').ifNotReturn().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a.episode-thumb[href*="-episode-"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('href').regex('-episode-(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().run();
    },
  },
};
