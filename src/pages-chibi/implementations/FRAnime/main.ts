import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const FRAnime: PageInterface = {
  name: 'FRAnime',
  domain: 'https://franime.fr',
  languages: ['French'],
  type: 'anime',
  urls: {
    match: ['*://franime.fr/*'],
  },
  search: 'https://franime.fr/recherche?search={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.querySelector('div#episode').boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      const season = $c.url().urlParam('s').number().ifNotReturn();
      const s = $c
        .if(
          season.greaterThanOrEqual(2).run(),
          $c.string(' Season ').concat(season.string().run()).run(),
          $c.string('').run(),
        )
        .run();

      return getVideoJson($c).get('name').ifNotReturn().string().trim().concat(s).run();
    },
    getIdentifier($c) {
      return $c
        .this('sync.getTitle')
        .replaceRegex('[^A-Za-z0-9]+', '-')
        .replaceRegex('^-+|-+$', '')
        .toLowerCase()
        .run();
    },
    getImage($c) {
      return getVideoJson($c).get('thumbnailUrl').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .url()
        .string()
        .replaceRegex('([?&])(ep|epp)=[^&#]*', '')
        .replaceRegex('?&', '?')
        .replaceRegex('[?&]$', '')
        .run();
    },
    getEpisode($c) {
      return $c.url().urlParam('ep').number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.querySelector('div#episode').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
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
      return $c
        .querySelector('#episode')
        .parent()
        .parent()
        .next()
        .findAll('a')
        .run();
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
      return $c.domReady().trigger().detectChanges($c.url().run(), $c.trigger().run()).run();
    },
  },
};

function getVideoJson($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('[type="application/ld+json"]')
    .arrayFind($el => $el.text().includes('VideoObject').run())
    .ifNotReturn()
    .text()
    .jsonParse();
}
