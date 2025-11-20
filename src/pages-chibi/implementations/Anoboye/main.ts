import { PageInterface } from '../../pageInterface';

export const Anoboye: PageInterface = {
  name: 'Anoboye',
  domain: 'https://anoboye.com',
  languages: ['English', 'Indonesian'],
  type: 'anime',
  urls: {
    match: ['*://anoboye.com/*'],
  },
  search: 'https://anoboye.com/?s={searchtermPlus}',
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
      return $c.querySelector('.anime-title a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.anime-title a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
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
        .and(
          $c.url().urlPart(3).boolean().run(),
          $c.url().urlPart(4).boolean().not().run(),
          $c.querySelector('h1.entry-title').boolean().run(),
          $c.querySelector('.thumbook').boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1.entry-title').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(3).trim().run();
    },
    getImage($c) {
      return $c.querySelector('.thumbook .thumb img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.entry-title').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.eplister a').run();
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
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
  },
};
