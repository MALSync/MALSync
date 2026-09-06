import { PageInterface } from '../../pageInterface';

export const AniZone: PageInterface = {
  name: 'AniZone',
  domain: 'https://anizone.to',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://anizone.to/*'],
  },
  search: 'https://anizone.to/anime?search={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(5).boolean().run(), $c.url().urlPart(3).equals('anime').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1 a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('h1 a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('[x-ref]')
        .next()
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('anime').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('img[alt]').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').parent().uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      const list = $c.querySelectorAll('li a');
      return $c
        .if(list.length().equals(0).run(), $c.querySelectorAll('a[wire\\:key]').run(), list.run())
        .run();
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
