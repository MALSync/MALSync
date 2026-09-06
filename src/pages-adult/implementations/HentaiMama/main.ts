import { PageInterface } from '../../../pages-chibi/pageInterface';

export const hentaimama: PageInterface = {
  name: 'Hentaimama',
  domain: 'https://hentaimama.io',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://hentaimama.io/*'],
    player: {
      hentaimama: ['*://*.hentaimama.io/new*'],
    },
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('episodes').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#info h1').text().trim().replaceRegex('-[^-]*$', '').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getOverviewUrl').urlPart(4).trim().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('#pag_episodes a[href*="/tvshows/"]')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).regex('-episode-(\\d+)', 1).number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('tvshows').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.data h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c
        .querySelector('#single .sheader .poster img')
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.data h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#episodes article').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
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
