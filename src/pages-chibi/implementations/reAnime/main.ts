import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import type { PageInterface } from '../../pageInterface';

export const ReAnime: PageInterface = {
  name: 'Re:Anime',
  domain: 'https://reanime.to/',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://reanime.to/*'],
  },

  sync: {
    isSyncPage($c) {
      return $c.url().contains('/watch/').run();
    },
    getTitle($c) {
      return $c
        .querySelector('div.watch-info-enter p.line-clamp-2, div.watch-info-enter p.text-xs')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).ifNotReturn().split('-').last().run();
    },
    getOverviewUrl($c) {
      return getJsonData($c).get('partOfSeries').get('url').ifNotReturn().run();
    },
    getEpisode($c) {
      return $c.url().urlParam('ep').number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.episode-playing')
        .next()
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().contains('/anime/').run();
    },
    getTitle($c) {
      return $c.querySelector('h1.font-bold.text-white').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).ifNotReturn().split('-').last().run();
    },
    getImage($c) {
      return $c
        .querySelector('img.rounded-lg.object-cover')
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('div.relative.z-10.flex.flex-col.gap-4').uiAfter().run();
    },
  },

  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },

    overviewIsReady($c) {
      return $c
        .waitUntilTrue($c.querySelector('h1.font-bold.text-white').boolean().run())
        .trigger()
        .run();
    },

    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .querySelector('div.watch-info-enter p.line-clamp-2, div.watch-info-enter p.text-xs')
            .boolean()
            .run(),
        )
        .trigger()
        .run();
    },

    ready($c) {
      return $c.domReady().trigger().run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('script[type="application/ld+json"]')
    .arrayFind(script => script.text().contains('"TVEpisode"').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}
