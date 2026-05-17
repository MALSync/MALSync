import { PageInterface } from '../../pageInterface';

export const KappaBeast: PageInterface = {
  name: 'KappaBeast',
  domain: 'https://kappabeast.com',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://kappabeast.com/*'],
  },
  search: 'https://kappabeast.com/?s={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(5).matches('(\\d+)').run(),
          $c.url().urlPart(3).equals('reader').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').ifNotReturn().text().replaceLinebreaks().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/series/<identifier>')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('option:checked')
        .prev()
        .ifNotReturn()
        .string('/reader/<identifier>/')
        .replace('<identifier>', $c.this('sync.getIdentifier').run())
        .concat($c.querySelector('option:checked').prev().getAttribute('value').ifNotReturn().run())
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('.w-full img').countAbove().run(),
        total: $c => $c.querySelectorAll('.w-full img').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('series').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').ifNotReturn().text().replaceLinebreaks().trim().run();
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
      return $c.querySelectorAll('.grid > a[href*="reader"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').number().run();
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
          $c.querySelector('.grid > a[href*="reader"]').ifNotReturn().parent().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
