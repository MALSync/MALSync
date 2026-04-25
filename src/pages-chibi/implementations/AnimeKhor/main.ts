import { PageInterface } from '../../pageInterface';

export const AnimeKhor: PageInterface = {
  name: 'AnimeKhor',
  domain: 'https://animekhor.org',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://animekhor.org/*'],
  },
  search: 'https://animekhor.org/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).boolean().run(),
          $c.url().urlPart(3).matches('-episode-').run(),
          $c.url().urlPart(4).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.lm .year a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.lm .year a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(3).regex('-episode-(\\d+)', 1).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.naveps [aria-label="next"]')
        .getAttribute('href')
        .ifNotReturn()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('anime').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('.thumb > img').getAttribute('src').log().ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.entry-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.epcheck .eplister li').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('div.epl-num').text().number().run();
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
