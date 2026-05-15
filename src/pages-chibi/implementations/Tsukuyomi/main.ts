import { PageInterface } from '../../pageInterface';

export const Tsukuyomi: PageInterface = {
  name: 'Tsukuyomi',
  domain: 'https://tsukuyomi.tv',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://tsukuyomi.tv/*'],
  },
  search: 'https://tsukuyomi.tv/search?q={searchTerms}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('watch').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.wp-title').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.querySelector('.wp-back').getAttribute('href').urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    getImage($c) {
      return $c
        .querySelector('.anime-cover')
        .getAttribute('src')
        .ifNotReturn()
        .replace('medium', 'large')
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('.ep-cell.cur')
        .next()
        .ifNotReturn()
        .url()
        .replaceRegex('\\d+$', $c.querySelector('.ep-cell.cur').next().text().trim().run())
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('anime').run();
    },
    getTitle($c) {
      return $c.querySelector('.main-title').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    uiInjection($c) {
      return $c.querySelector('.meta').uiPrepend().run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .if(
          $c.querySelector('.ep-btn').boolean().run(),
          $c.querySelectorAll('.ep-btn').run(),
          $c.querySelectorAll('.ep-cell').run(),
        )
        .run();
    },
    elementEp($c) {
      return $c.text().trim().number().run();
    },
    elementUrl($c) {
      return $c
        .url()
        .replace('anime', 'watch')
        .setVariable('ep')
        .if(
          $c.querySelector('.ep-btn').boolean().run(),
          $c
            .getVariable('ep')
            .string()
            .concat('/')
            .concat($c.target().this('list.elementEp').run())
            .run(),
          $c
            .getVariable('ep')
            .string()
            .replaceRegex('\\d+$', $c.target().this('list.elementEp').run())
            .run(),
        )
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges($c.querySelector('.ep-btn').ifNotReturn().run(), $c.trigger().run())
        .run();
    },
  },
};
