import { PageInterface } from '../../pageInterface';

export const Diziwatch: PageInterface = {
  name: 'Diziwatch',
  type: 'anime',
  domain: 'https://diziwatch.tv',
  languages: ['Turkish'],
  urls: {
    match: ['*://*.diziwatch.tv/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().regex('dizi/[^/]+/sezon-\\d+/bolum-\\d+', 0).boolean().run();
    },
    getTitle($c) {
      return $c
        .querySelector('#router-view .col-span-7 h2.text-sm.text-white')
        .ifNotReturn()
        .text()
        .trim()
        .replaceRegex('\\s+\\d+\\.\\s*Sezon.*$', '')
        .replaceRegex('\\s+Season\\s*\\d+.*$', '')
        .run();
    },
    getIdentifier($c) {
      return $c.url().regex('dizi/([^/?#]+)', 1).run();
    },
    getOverviewUrl($c) {
      return $c.url().regex('(https://diziwatch\\.tv/dizi/[^/?#]+)', 1).run();
    },
    getEpisode($c) {
      return $c.url().regex('bolum-(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.col-span-7 a[href*="/bolum-"]')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('#player-video').ifNotReturn().uiBefore().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().regex('dizi/[^/]+(?:/sezon-\\d+)?/?$', 0).boolean().run(),
          $c.url().contains('/bolum-').not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('#router-view h2.text-sm.text-white')
        .ifNotReturn()
        .text()
        .trim()
        .replaceRegex('\\s+\\d+\\.\\s*Sezon.*$', '')
        .replaceRegex('\\s+Season\\s*\\d+.*$', '')
        .run();
    },
    getIdentifier($c) {
      return $c.url().regex('dizi/([^/?#]+)', 1).run();
    },
    getImage($c) {
      return $c
        .querySelector('#router-view img.aspect-\\[30/40\\], #router-view img.lazyload')
        .ifNotReturn()
        .getAttribute('src')
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('#router-view .boxitm').ifNotReturn().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#router-view .sm\\:col-span-3 a[href*="/bolum-"]').run();
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
      return $c.domReady().trigger().detectURLChanges($c.trigger().run()).run();
    },
  },
};
