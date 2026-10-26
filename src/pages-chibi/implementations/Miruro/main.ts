import { PageInterface } from '../../pageInterface';

export const Miruro: PageInterface = {
  name: 'Miruro',
  domain: ['https://miruro.cx', 'https://www.miruro.to'],
  languages: ['English'],
  type: 'anime',
  urls: {
    match: [
      '*://*.miruro.to/*',
      '*://*.miruro.tv/*',
      '*://*.miruro.bz/*',
      '*://*.miruro.cx/*',
      '*://*.miruro.pw/*',
      '*://*.miruro.ws/*',
      '*://*.miruro.ru/*',
    ],
    player: {
      strm: ['*://strm.cx/*'],
      megaplay: ['*://megaplay.buzz/*', '*://vidwish.live/*'],
    },
  },
  search: 'https://miruro.cx/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('watch').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.fn($c.querySelector('h1 a').ifNotReturn().text().trim().run()).run(),
          $c.fn($c.querySelector('h2').ifNotReturn().text().trim().run()).run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('a[href*="info/"] img').getAttribute('src').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('a[href*="info/"]').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlParam('ep').number().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector("a[href^='https://myanimelist.net']")
            .getAttribute('href')
            .ifNotReturn()
            .run(),
          anilistUrl: $c
            .querySelector("a[href^='https://anilist.co']")
            .getAttribute('href')
            .ifNotReturn()
            .run(),
        })
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('info').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.fn($c.querySelector('#root h1 span').ifNotReturn().text().trim().run()).run(),
          $c.fn($c.querySelector('h1').ifNotReturn().text().trim().run()).run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    uiInjection($c) {
      return $c
        .coalesce(
          $c.fn($c.querySelector('#root [class*="_mainColumn"] h1').ifNotReturn().run()).run(),
          $c.fn($c.querySelector('h1').ifNotReturn().run()).run(),
        )
        .uiAfter()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector("a[href^='https://myanimelist.net']")
            .getAttribute('href')
            .ifNotReturn()
            .run(),
          anilistUrl: $c
            .querySelector("a[href^='https://anilist.co']")
            .getAttribute('href')
            .ifNotReturn()
            .run(),
        })
        .run();
    },
    getImage($c) {
      return $c
        .coalesce(
          $c
            .fn(
              $c
                .querySelector('img[alt="Cover"]')
                .ifNotReturn()
                .getAttribute('src')
                .ifNotReturn()
                .run(),
            )
            .run(),
          $c
            .fn(
              $c
                .querySelector('.info-cover img')
                .ifNotReturn()
                .getAttribute('src')
                .ifNotReturn()
                .run(),
            )
            .run(),
        )
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .querySelectorAll(
          '.watch-episode-panel a.episode-card, .inertia-track > a[href*="/watch/"][href*="ep="]',
        )
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').urlParam('ep').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c
            .querySelector(
              '.watch-episode-panel a.episode-card, .inertia-track > a[href*="/watch/"][href*="ep="]',
            )
            .ifNotReturn()
            .getAttribute('href')
            .run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
