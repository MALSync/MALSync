import { PageInterface } from '../../pageInterface';

function extractSlug($c) {
  return $c.url().regex('titles/\\d+/([^/]+)', 1).run();
}

function extractSeason($c) {
  return $c.url().regex('season/(\\d+)', 1).run();
}

function extractEpisodeNumber($c) {
  return $c.url().regex('episode/(\\d+)', 1).number().run();
}

function getOverviewAnchor($c) {
  return $c.querySelector('h1.t-title a[href*="/titles/"]:not([href*="/season/"])').ifNotReturn();
}

export const Animecix: PageInterface = {
  name: 'Animecix',
  type: 'anime',
  domain: 'https://animecix.tv',
  languages: ['Turkish'],
  urls: {
    match: ['*://*.animecix.tv/*', '*://*.animecix.com/*', '*://*.animecix.net/*'],
  },
  sync: {
    isSyncPage($c) {
      // Improved regex pattern to ensure we're matching the correct URL structure
      return $c.url().regex('titles/\\d+/[^/]+/season/\\d+/episode/\\d+', 0).boolean().run();
    },
    getTitle($c) {
      return getOverviewAnchor($c).text().trim().run();
    },
    getIdentifier($c) {
      const slug = extractSlug($c);
      const season = extractSeason($c);
      // Simplified approach to handle ChibiJson values
      return $c.string(slug).run();
    },
    getOverviewUrl($c) {
      return getOverviewAnchor($c).getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return extractEpisodeNumber($c);
    },
    nextEpUrl($c) {
      // Simplified implementation using only ChibiScript functions
      return $c.string('').run();
    },
    uiInjection($c) {
      // Enhanced selector to handle different page structures
      return $c
        .querySelector('.episode-details, .rating-meta, .episode-title, .video-meta, .episode-info')
        .uiAfter()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      // Improved detection: overview page is when we have /titles/ID/SLUG but NOT /season/SEASON/episode/EPISODE
      return $c
        .and(
          $c.url().regex('titles/\\d+/[^/]+$', 0).boolean().run(),
          $c.url().regex('season/\\d+/episode/\\d+', 0).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      // Use the same approach as sync.getTitle instead of referencing Animecix.sync.getTitle
      return getOverviewAnchor($c).text().trim().run();
    },
    getIdentifier($c) {
      return extractSlug($c);
    },
    getImage($c) {
      return $c.string('').run(); // Return empty string instead of null
    },
    uiInjection($c) {
      // Enhanced selector to handle different page structures
      return $c
        .querySelector('.rating-meta, .title-meta, h1.t-title, .series-meta, .anime-info')
        .uiAfter()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll('app-season-episodes a[href*="/season/"][href*="/episode/"]')
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      // Use the same approach as other ChibiScript implementations
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
    },
  },
  lifecycle: {
    setup($c) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      // Use domReady with detectURLChanges for better page load handling
      return $c.domReady().trigger().detectURLChanges($c.trigger().run()).run();
    },
  },
};
