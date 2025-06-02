import type { ChibiGenerator } from 'src/chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const Crunchyroll: PageInterface = {
  name: 'Crunchyroll',
  domain: ['https://www.crunchyroll.com'],
  languages: [
    'English',
    'Spanish',
    'Portuguese',
    'French',
    'German',
    'Arabic',
    'Italian',
    'Russian',
  ],
  type: 'anime',
  urls: {
    match: ['*://*.crunchyroll.com/*'],
  },
  search: 'https://www.crunchyroll.com/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .or($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(4).equals('watch').run())
        .run();
    },
    getTitle($c) {
      return getJsonData($c)
        .get('partOfSeason')
        .get('name')
        .ifNotReturn()
        .string()
        .replaceRegex('\\([^\\)]+\\)', '')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c
        .this('sync.getTitle')
        .concat(getJsonData($c).get('partOfSeason').get('seasonNumber').run())
        .run();
    },
    getOverviewUrl($c) {
      return getJsonData($c).get('partOfSeason').get('@id').run();
    },
    getEpisode($c) {
      return getJsonData($c).get('episodeNumber').number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('[data-t="next-episode"] a')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectChanges($c.title().run(), $c.trigger().run()).domReady().trigger().run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('episodeNumber').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}
