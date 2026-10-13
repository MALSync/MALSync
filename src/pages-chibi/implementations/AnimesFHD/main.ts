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
      // The document title keeps the season ("X — 2ª temporada — Episódio 1 | AnimesFHD"),
      // #episode-meta and #breadcrumb lose it once the site hydrates.
      return cleanTitle(
        $c
          .title()
          .replaceRegex('\\s*\\|\\s*AnimesFHD\\s*$', '')
          .replaceRegex('\\s+[—–-]\\s+Epis[oó]dio\\s.*$', ''),
      );
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
      return $c.querySelector('#breadcrumb').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.querySelector('#episode-num').text().trim().number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .or($c.url().urlPart(3).equals('serie').run(), $c.url().urlPart(3).equals('series').run())
        .run();
    },
    getTitle($c) {
      // #series-alt is the English title, which MAL finds more reliably than the long romaji
      // titles of the site. It belongs to the first season though, so seasons use #series-title.
      return cleanTitle(
        $c.if(
          $c
            .and(
              $c.querySelector('#series-title').text().matches('temporada|parte', 'i').not().run(),
              $c.querySelector('#series-alt').boolean().run(),
              $c.querySelector('#series-alt').text().trim().boolean().run(),
            )
            .run(),
          $c.querySelector('#series-alt').text().trim().run(),
          $c.querySelector('#series-title').text().trim().run(),
        ),
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
      // Switching season/episode in the player changes the url ~3s before the content.
      // The comment form gets the episode id once the content of the current url is rendered.
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('#breadcrumb').boolean().run(),
              $c
                .or(
                  $c.querySelector('#comment-form[data-episode-id]').boolean().not().run(),
                  $c
                    .querySelector('#comment-form')
                    .getAttribute('data-episode-id')
                    .equals($c.url().urlPart(4).run())
                    .run(),
                )
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              // Set once the series of the current url is rendered (also after a season switch)
              $c.querySelector('#series-title[data-title-for]').boolean().run(),
              $c
                .querySelector('#series-title')
                .getAttribute('data-title-for')
                .equals($c.url().this('overview.getIdentifier').run())
                .run(),
              $c.querySelector('#series-title').text().trim().boolean().run(),
              $c
                .querySelector('#series-title')
                .text()
                .trim()
                .matches('^(Anime não encontrado|Anime indisponível)$')
                .not()
                .run(),
              $c.querySelector('#episodes-grid[aria-busy="true"]').boolean().not().run(),
            )
            .run(),
        )
        .trigger()
        .run();
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
  return (
    $c
      .replaceRegex('\\s*\\((Dublado|Legendado)\\)\\s*$', '')
      .replaceRegex('\\s*-\\s*Todos os Epis[oó]dios(?: Online)?\\s*$', '')
      .replaceRegex('\\s*-\\s*Animes? Online\\s*$', '')
      .replaceRegex('\\s+(Dublado|Legendado)\\s*$', '')
      .replaceRegex('\\s+[—–-]\\s+Filme\\s*$', '')
      // Seasons: "X — 2ª temporada", "X 2ª Temporada", "X - Temporada 2" (+ optional "Parte N")
      .replaceRegex('\\s*[—–-]?\\s*\\b(\\d{1,2})\\s*[ªº°]?\\s*temporada\\b', ' Season $1')
      .replaceRegex('\\s*[—–-]?\\s*\\btemporada\\s*(\\d{1,2})\\b', ' Season $1')
      .replaceRegex('\\s*[—–-]?\\s*\\bparte\\s*(\\d{1,2})\\s*$', ' Part $1')
      // MAL entries of the first season have no season suffix
      .replaceRegex('\\s+Season 1(?=\\s|$)', '')
      .trim()
      .run()
  );
}
