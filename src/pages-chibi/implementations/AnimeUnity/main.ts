import { PageInterface } from '../../pageInterface';

export const AnimeUnity: PageInterface = {
  name: 'AnimeUnity',
  domain: 'https://animeunity.cx',
  languages: ['Italian'],
  type: 'anime',
  urls: {
    match: [
      '*://*.animeunity.it/anime/*',
      '*://*.animeunity.tv/anime/*',
      '*://*.animeunity.to/anime/*',
      '*://*.animeunity.co/anime/*',
      '*://*.animeunity.cx/*',
    ],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('anime').run(),
          $c.url().urlStrip().urlPart(4).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1 span.select-text').text().replace('(ITA)', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlStrip().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().urlStrip().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c
        .querySelectorAll('button.bg-blue-200')
        .arrayFind($el => $el.text().trim().matches('^\\d+$').run())
        .ifNotReturn()
        .text()
        .trim()
        .number()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector('a[href*="myanimelist.net/anime/"]')
            .ifNotReturn()
            .getAttribute('href')
            .run(),
        })
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h1 span.select-text').parent().uiAfter().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.domReady().detectURLChanges($c.trigger().run()).trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .querySelector('link[rel="canonical"]')
            .ifNotReturn()
            .getAttribute('href')
            .urlStrip()
            .urlPart(4)
            .equals($c.url().urlStrip().urlPart(4).run())
            .run(),
        )
        .trigger()
        .run();
    },
  },
};
