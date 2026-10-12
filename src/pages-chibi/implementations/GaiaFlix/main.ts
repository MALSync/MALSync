import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// Input: a watch url. AniList ids get a prefix so they don't collide with TMDB ids,
// TMDB tv shows get the season because every season is its own entry.
function watchUrlIdentifier($c: ChibiGenerator<unknown>) {
  const watchUrl = () => $c.getVariable<string>('watchUrl');
  const watchId = () => $c.getVariable<string>('watchId');

  return $c
    .string()
    .setVariable('watchUrl')
    .urlPart(6)
    .setVariable('watchId')
    .if(
      watchUrl().urlParam('isTmdb').equals('1').run(),
      $c
        .if(
          watchUrl().urlParam('tmdbType').equals('tv').run(),
          watchId().concat('-season-').concat(watchUrl().urlParam('season').string().run()).run(),
          watchId().run(),
        )
        .run(),
      $c.string('anilist-').concat(watchId().run()).run(),
    );
}

// Title and poster of the details page
function detailData($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('[data-detail-favorite]')
    .ifNotReturn()
    .getAttribute('data-detail-favorite')
    .ifNotReturn()
    .jsonParse() as ChibiGenerator<{ title: string; poster: string }>;
}

// The content is rendered after the url changes, so also trigger when it is replaced
function contentKey($c: ChibiGenerator<unknown>) {
  return $c.coalesce(
    $c.fn($c.querySelector('#watch-navigator-title').ifNotReturn().text().run()).run(),
    $c.fn($c.querySelector('.detail-play-button').ifNotReturn().getAttribute('href').run()).run(),
  );
}

// The site uses hash routing, so the url parts start after "/#/":
// watch:    #/watch/anime/<id>?season=<n>&episode=<n>[&isTmdb=1&tmdbType=tv|movie]
// overview: #/detail/<tv|movie>/<tmdbId> or #/anime-title/<slug>
export const GaiaFlix: PageInterface = {
  name: 'GaiaFlix',
  domain: 'https://gaiaflix.live',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://gaiaflix.live/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).equals('watch').run(),
          $c.url().urlPart(5).equals('anime').run(),
          $c.url().urlPart(6).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#watch-navigator-title').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().exec(watchUrlIdentifier).run();
    },
    getOverviewUrl($c) {
      // The watch page has no link to the details page, so use the first episode instead
      return $c.url().replaceRegex('episode=\\d+', 'episode=1').run();
    },
    getEpisode($c) {
      return $c.url().urlParam('episode').number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).matches('^(detail|anime-title)$').run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.exec(detailData).get('title').ifNotReturn().string().trim().run();
    },
    getIdentifier($c) {
      return $c
        .querySelector('.detail-play-button')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .exec(watchUrlIdentifier)
        .run();
    },
    getImage($c) {
      return $c.exec(detailData).get('poster').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.detail-synopsis').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      // Two layouts, depending on the anime
      return $c.querySelectorAll('.anime-flat-episode, .episode-list .episode-card').run();
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
      return $c
        .detectURLChanges($c.trigger().run(), { ignoreQuery: false, ignoreAnchor: false })
        .detectChanges($c.exec(contentKey).run(), $c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
  },
};
