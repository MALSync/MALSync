import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// Episode pages: https://22.findanime.me/<slug>/series<N>
// series0 is the "Все серии" page and is not a real episode.
const SYNC_URL_REGEX = '^https?://[^/]+/[^/?#]+/series[1-9]\\d*(?:[/?#]|$)';

// Page title of an episode:
// "Смотреть аниме <RU> сезон 1 - <RU> - <Original title> на русском онлайн. Серия 16 ..."
const SYNC_TITLE_REGEX = '.* - (.+?) на русском онлайн';

function getSyncTitle($c: ChibiGenerator<unknown>) {
  return $c.if(
    $c.title().matches(SYNC_TITLE_REGEX).run(),
    $c.title().regex(SYNC_TITLE_REGEX, 1).trim().run(),
    $c.querySelector('a.vi-breadcrumbs__link').ifNotReturn().text().trim().run(),
  );
}

function getOriginalTitleHeader($c: ChibiGenerator<unknown>) {
  return $c
    .querySelectorAll('#alt-names-dialog .modal-body > h5')
    .arrayFind($h => $h.text().contains('Оригинальное название').run());
}

function getOverviewTitle($c: ChibiGenerator<unknown>) {
  // "Оригинальное название" from the alternative names dialog, fallback to the main (russian) title
  return $c.if(
    $c.exec(getOriginalTitleHeader).boolean().run(),
    $c.exec(getOriginalTitleHeader).next().text().trim().run(),
    $c.querySelector('h1.cr-hero-names__main').ifNotReturn().text().trim().run(),
  );
}

export const FindAnime: PageInterface = {
  name: 'FindAnime',
  domain: 'https://22.findanime.me',
  languages: ['Russian'],
  type: 'anime',
  urls: {
    match: ['*://*.findanime.me/*'],
    player: {
      farmedia: ['*://*.farmedia.live/*'],
    },
  },
  search: 'https://22.findanime.me/search/advanced?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().matches(SYNC_URL_REGEX).run();
    },
    getTitle($c) {
      return $c.exec(getSyncTitle).run();
    },
    getIdentifier($c) {
      return $c.url().urlStrip().urlPart(3).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a.vi-breadcrumbs__link')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .urlStrip()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlStrip().regex('/series(\\d+)$', 1).number().run();
    },
    nextEpUrl($c) {
      // Last episode links to /<slug>/finish, so only accept real episode links
      return $c
        .querySelector('a.vi-btn[href*="/series"]:has(.fa-angles-right)')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .urlStrip()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlStrip().urlPart(3).boolean().run(),
          $c.url().urlStrip().urlPart(4).boolean().not().run(),
          $c.querySelector('h1.cr-hero-names__main').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.exec(getOverviewTitle).run();
    },
    getIdentifier($c) {
      return $c.url().urlStrip().urlPart(3).run();
    },
    uiInjection($c) {
      return $c.querySelector('.cr-hero').uiAfter().run();
    },
    getImage($c) {
      // Take the first poster, it is either lazy loaded (data-src) or has a plain src
      return $c
        .if(
          $c
            .querySelector('img.cr-hero-poster__img')
            .ifNotReturn()
            .getAttribute('data-src')
            .boolean()
            .run(),
          $c.querySelector('img.cr-hero-poster__img').getAttribute('data-src').run(),
          $c.querySelector('img.cr-hero-poster__img').getAttribute('src').run(),
        )
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll('.chapters td.item-title a.chapter-link')
        .filter($el => $el.getAttribute('href').matches('/series[1-9]\\d*$').run())
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('href').regex('/series(\\d+)$', 1).number().run();
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
