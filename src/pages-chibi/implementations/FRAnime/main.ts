import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const FRAnime: PageInterface = {
  name: 'FRAnime',
  domain: 'https://franime.fr',
  languages: ['French'],
  type: 'anime',
  minimumVersion: '0.13.0',
  urls: {
    match: ['*://franime.fr/*'],
  },
  search: 'https://franime.fr/recherche?search={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.url().urlParam('ep').boolean().run(),
          $c.url().urlParam('anime_id').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return getVideoJson($c).get('name').ifNotReturn().string().trim().run();
    },
    getIdentifier($c) {
      // Kept as the old "<title> Season N" slug, so existing identifiers stay valid
      const season = $c.url().urlParam('s').number().ifNotReturn();
      const s = $c
        .if(
          season.greaterThanOrEqual(2).run(),
          $c.string(' Season ').concat(season.string().run()).run(),
          $c.string('').run(),
        )
        .run();

      return $c
        .this('sync.getTitle')
        .concat(s)
        .replaceRegex('[^A-Za-z0-9]+', '-')
        .replaceRegex('^-+|-+$', '')
        .toLowerCase()
        .run();
    },
    getImage($c) {
      return getVideoJson($c).get('thumbnailUrl').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c.url().replaceRegex('([?&])ep=[^&#]*', '').run();
    },
    getEpisode($c) {
      return $c.url().urlParam('ep').number().run();
    },
    getSeason($c) {
      return $c.exec(getSeason).run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.url().urlParam('ep').boolean().not().run(),
          $c.url().urlParam('anime_id').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getSeason($c) {
      return $c.exec(getSeason).run();
    },
    getImage($c) {
      return $c.this('sync.getImage').run();
    },
    uiInjection($c) {
      return $c.querySelector('#episode').parent().uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.episode-card').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
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
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};

// s=1, 1.5 (second part of season 1), 2, ... Parts and season 1 are not passed on,
// NaN is ignored as season
function getSeason($c: ChibiGenerator<unknown>) {
  return $c
    .url()
    .urlParam('s')
    .ifNotReturn()
    .setVariable('season')
    .matches('^\\d+$')
    .ifNotReturn($c.string('NaN').number().run())
    .getVariable<string>('season')
    .number()
    .setVariable('season')
    .equals(1)
    .ifThen($c => $c.string('NaN').number().return().run())
    .getVariable<number>('season');
}

function getVideoJson($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('VideoObject').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}
