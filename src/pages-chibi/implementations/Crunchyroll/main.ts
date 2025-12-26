import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
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
      const seasonSuffix = $c
        .if(
          getSeasonNumber($c).number().greaterThan(1).run(),
          $c.string(' Season ').concat(getSeasonNumber($c).string().run()).run(),
          $c.string('').run(),
        )
        .run();

      return getSeriesName($c)
        .ifNotReturn()
        .string()
        .replaceRegex('\\([^\\)]+\\)', '')
        .trim()
        .concat(seasonSuffix)
        .run();
    },
    getIdentifier($c) {
      return getSeriesName($c)
        .concat(getSeasonName($c).run())
        .concat(getSeasonNumber($c).run())
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

function getSeasonNumber($c: ChibiGenerator<unknown>) {
  return getJsonData($c).get('partOfSeason').get('seasonNumber');
}

function getSeasonName($c: ChibiGenerator<unknown>) {
  return getJsonData($c).get('partOfSeason').get('name').string();
}

function getSeriesName($c: ChibiGenerator<unknown>) {
  return getJsonData($c).get('partOfSeries').get('name').string();
}

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('episodeNumber').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}
