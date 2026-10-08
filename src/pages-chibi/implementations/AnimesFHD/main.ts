import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const AnimesFHD: PageInterface = {
  name: 'AnimesFHD',
  domain: 'https://animesfhd.net',
  languages: ['Portuguese'],
  type: 'anime',
  urls: {
    match: ['*://animesfhd.net/*', '*://www.animesfhd.net/*', '*://animesfhd.pages.dev/*'],
  },
  search: 'https://animesfhd.net/animes?q={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .or($c.url().urlPart(3).equals('episod').run(), $c.url().urlPart(3).equals('episode').run())
        .run();
    },
    getTitle($c) {
      return cleanTitle($c.querySelector('#episode-meta').text().trim().split(' · ').at(0));
    },
    getIdentifier($c) {
      return $c
        .querySelector('#breadcrumb')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .urlPart(4)
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('#breadcrumb')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.querySelector('#episode-num').text().trim().number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .or(
          $c.url().urlPart(3).equals('serie').run(),
          $c.url().urlPart(3).equals('series').run(),
        )
        .run();
    },
    getTitle($c) {
      return cleanTitle(
        $c
          .querySelector('#series-alt')
          .ifNotReturn($c.querySelector('#series-title').text().trim().run())
          .text()
          .trim(),
      );
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).ifNotReturn($c.url().urlParam('id').run()).run();
    },
    uiInjection($c) {
      return $c.querySelector('#series-kpis').uiAfter().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#episodes-grid a.card--ep').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.card__title').text().regex('EP\\.?\\s*(\\d+)', 1).number().run();
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
      return $c.waitUntilTrue($c.querySelector('#breadcrumb').boolean().run()).trigger().run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('#series-title').boolean().run()).trigger().run();
    },
    listChange($c) {
      return $c
        .waitUntilTrue($c.querySelector('#episodes-grid a.card--ep').boolean().run())
        .trigger()
        .run();
    },
  },
};

function cleanTitle($c: ChibiGenerator<string>) {
  return $c
    .replaceRegex('\\s*\\(Dublado\\)\\s*$', '')
    .replaceRegex('\\s*-\\s*Todos os Epis[oó]dios(?: Online)?\\s*$', '')
    .replaceRegex('\\s*-\\s*Animes? Online\\s*$', '')
    .replaceRegex('\\s+Online\\s*$', '')
    .replaceRegex('\\s+1ª?\\s*Temporada\\s*$', ' 1st Season')
    .replaceRegex('\\s+2ª?\\s*Temporada\\s*$', ' 2nd Season')
    .replaceRegex('\\s+3ª?\\s*Temporada\\s*$', ' 3rd Season')
    .replaceRegex('\\s+(\\d{1,2})ª?\\s*Temporada\\s*$', ' $1th Season')
    .replaceRegex('\\s+Dublado\\s*$', '')
    .trim()
    .run();
}
