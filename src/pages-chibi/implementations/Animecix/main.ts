import { PageInterface } from '../../pageInterface';

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
      return $c.url().regex('titles/\\d+/[^/]+/season/\\d+/episode/\\d+', 0).boolean().run();
    },
    getTitle($c) {
      return $c
        .querySelector('h1.t-title a[href*="/titles/"]:not([href*="/season/"])')
        .ifNotReturn()
        .text()
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().regex('titles/\\d+/([^/]+)', 1).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('h1.t-title a[href*="/titles/"]:not([href*="/season/"])')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().regex('episode/(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('a[href*="/episode/"].next-episode, a[title*="Sonraki"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c
        .querySelector('.episode-details, .video-meta, .episode-info, .episode-title')
        .ifNotReturn()
        .uiAfter()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().regex('titles/\\d+/[^/]+$', 0).boolean().run(),
          $c.url().regex('season/\\d+/episode/\\d+', 0).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1.t-title').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().regex('titles/\\d+/([^/]+)', 1).run();
    },
    getImage($c) {
      return $c
        .querySelector('.series-image img, .anime-image img')
        .ifNotReturn()
        .getAttribute('src')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c
        .querySelector('.series-info, .anime-info, h1.t-title')
        .ifNotReturn()
        .uiAfter()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('app-season-episodes a[href*="/episode/"], .episode-list a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('href').regex('episode/(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().trigger().detectURLChanges($c.trigger().run()).run();
    },
  },
};
