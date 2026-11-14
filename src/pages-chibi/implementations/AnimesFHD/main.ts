import type { ChibiGenerator, ChibiJson } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const AnimesFHD: PageInterface = {
  name: 'AnimesFHD',
  domain: 'https://animesfhd.net',
  languages: ['Portuguese'],
  type: 'anime',
  urls: {
    // PlayerSingleton tracks the top-level video without iframe patterns.
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
      return malEpisode(
        $c.querySelector('#breadcrumb'),
        $c.querySelector('#episode-num').text().trim().number().run(),
      );
    },
    getMalUrl($c) {
      return malUrl($c, '#breadcrumb');
    },
    getImage($c) {
      return $c.this('overview.getImage').run();
    },
    nextEpUrl($c) {
      // The site exposes the next episode url in data-url once it is known.
      return $c
        .querySelectorAll('#ep-next[data-url]:not(:disabled)')
        .map($el => $el.getAttribute('data-url').trim().ifNotReturn().urlAbsolute().run())
        .type<string[]>()
        .first()
        .run();
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
      return $c
        .querySelector('[property="og:image"]')
        .ifNotReturn()
        .getAttribute('content')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return malUrl($c, '#series-title');
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
      return malEpisode(
        $c.setVariable('episodeElement'),
        $c
          .getVariable<Element>('episodeElement')
          .find('.card__title')
          .text()
          .regex('EP\\.?\\s*(\\d+)', 1)
          .number()
          .run(),
      );
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
      // Bound navigation retries for last episodes and failed requests.
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
        .waitUntilTrue(
          $c
            .or(
              $c.url().this('sync.nextEpUrl').boolean().run(),
              $c
                .getVariable<number>('nextEpisodeChecks', 0)
                .calculate('+', 1)
                .setVariable('nextEpisodeChecks')
                .greaterThanOrEqual(50)
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
      const checkList = $c.url().this('overview.isOverviewPage').ifNotReturn().trigger().run();

      return $c
        .waitUntilTrue($c.querySelector('#episodes-grid a.card--ep').boolean().run())
        .detectChanges(
          $c
            // Detached nodes detect identical re-renders without observing MALSync's classes.
            .getVariable<Element[]>('episodeElements', [])
            .arrayFind($el => $el.get('isConnected').boolean().not().run())
            .ifThen($c =>
              $c
                .getVariable<number>('listRevision', 0)
                .calculate('+', 1)
                .setVariable('listRevision')
                .run(),
            )
            .setVariable('episodeElements', $c.querySelectorAll('#episodes-grid a.card--ep').run())
            .querySelectorAll('#episodes-grid a.card--ep')
            .map($el =>
              $el
                .setVariable('episodeCard')
                .getAttribute('href')
                .concat(':')
                .concat(
                  $c.getVariable<Element>('episodeCard').this('list.elementEp').string().run(),
                )
                .run(),
            )
            .string()
            .concat(':')
            .concat($c.getVariable<number>('listRevision', 0).string().run())
            .run(),
          checkList,
        )
        .fn(checkList)
        .run();
    },
  },
};

function malUrl($c: ChibiGenerator<unknown>, selector: string) {
  return $c
    .querySelector(selector)
    .ifNotReturn($c.boolean(false).run())
    .getAttribute('data-mal-id')
    .ifNotReturn($c.boolean(false).run())
    .trim()
    .setVariable('malId')
    .matches('^[1-9]\\d*$')
    .ifNotReturn($c.boolean(false).run())
    .providerUrlUtility({
      malId: $c.getVariable<string>('malId').run(),
    })
    .run();
}

function malEpisode($c: ChibiGenerator<Element | null>, fallback: ChibiJson<number>) {
  return $c
    .ifNotReturn(fallback)
    .getAttribute('data-mal-episode')
    .ifNotReturn(fallback)
    .trim()
    .setVariable('malEpisode')
    .matches('^[1-9]\\d*$')
    .ifNotReturn(fallback)
    .getVariable<string>('malEpisode')
    .number()
    .run();
}

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
