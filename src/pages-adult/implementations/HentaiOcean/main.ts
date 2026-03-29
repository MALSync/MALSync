import { PageInterface } from '../../../pages-chibi/pageInterface';

export const HentaiOcean: PageInterface = {
  name: 'HentaiOcean',
  database: 'HentaiOcean',
  domain: 'https://hentaiocean.com',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://hentaiocean.com/*'],
    player: { hentaiOcean: ['*://w2.hentaiocean.com/*'] },
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).matches('watch').run();
    },
    getTitle($c) {
      return $c.querySelector('h1.title').text().trim().replaceRegex('\\d+$', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).replaceRegex('-\\d+$', '').run();
    },
    getOverviewUrl($c) {
      return $c.url().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(4).regex('-(\\d+)$', 1).number().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1.title').uiAfter().run();
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
