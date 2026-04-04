import { PageInterface } from '../../pageInterface';

export const TeamShadowi: PageInterface = {
  name: 'TeamShadowi',
  domain: 'https://www.team-shadowi.com/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://www.team-shadowi.com/*'],
  },
  search: 'https://www.team-shadowi.com/search?q={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(5).matches('\\d+').run(), $c.url().urlPart(3).equals('read').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('a[href*="/series"]').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('a[href*="/series"]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('[class*="chevron-right"]')
        .ifNotReturn()
        .closest('a')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        current: $c => $c.querySelectorAll('img[data-chapter-image]').countAbove().run(),
        total: $c => $c.querySelectorAll('img[data-chapter-image]').length().run(),
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
      return $c.querySelector('h1').ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).trim().run();
    },
    getImage($c) {
      return $c.querySelector('[href*="thumbnail"] img').getAttribute('src').ifNotReturn().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malUrl: $c
            .querySelector('a[href*="myanimelist"]')
            .getAttribute('href')
            .ifNotReturn()
            .run(),
          anilistUrl: $c
            .querySelector('a[href*="anilist"]')
            .getAttribute('href')
            .ifNotReturn()
            .run(),
        })
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('a[href*="read"]').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').ifNotReturn().urlAbsolute().run();
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
        .detectChanges(
          $c.querySelector('.space-y-2').text().ifNotReturn().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
