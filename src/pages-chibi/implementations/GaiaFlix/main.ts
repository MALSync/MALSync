import { PageInterface } from '../../pageInterface';

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
        .and($c.url().urlPart(3).matches('watch').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.url().urlParam('title').ifNotReturn().trim().run();
    },
    getIdentifier($c) {
      return $c
        .coalesce($c.url().urlParam('showId').ifNotReturn().run(), $c.url().urlPart(4).run())
        .run();
    },
    getOverviewUrl($c) {
      return $c.string('/detail/').concat($c.this('sync.getIdentifier').run()).urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlParam('e').number().run();
    },
    nextEpUrl($c) {
      return $c
        .url()
        .replaceRegex('ep=\\d+', `ep=${$c.this('sync.getEpisode').calculate('+', 1).run()}`)
        .log()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h3').uiBefore().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('detail').run(), $c.url().urlPart(4).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('.object-cover').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').parent().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.mt-10 a').run();
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
    listChange($c) {
      return $c
        .detectChanges($c.querySelector('.mt-10 a').ifNotReturn().text().run(), $c.trigger().run())
        .run();
    },
  },
};
