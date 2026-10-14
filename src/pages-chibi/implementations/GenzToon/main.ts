import { PageInterface } from '../../pageInterface';

export const GenzToon: PageInterface = {
  name: 'GenzToon',
  domain: 'https://genztoons.org',
  languages: ['English'],
  type: 'manga',
  computedType: $c => {
    // novels are marked with "[Novel]" in the title of chapter and series pages
    return $c
      .if($c.title().contains('[Novel]').run(), $c.string('novel').run(), $c.string('manga').run())
      .run();
  },
  urls: {
    match: ['*://genztoons.org/*', '*://genzupdates.com/*'],
  },
  search: 'https://genztoons.org/series?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(4).boolean().run(), $c.url().urlPart(3).equals('chapter').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.opacity-100[alt]').text().replaceAll('[Novel]', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getOverviewUrl').this('overview.getIdentifier').run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.opacity-100[alt]')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.opacity-100[alt]')
        .closest('span')
        .ifNotReturn()
        .text()
        .regex('chapter[ _-]?(\\d+)', 1)
        .number()
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('img[src*="arrow-right"]')
        .closest('a')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    readerConfig: [
      {
        // novel chapters are text, comic chapters only images
        condition: $c => $c.querySelector('#pages p').boolean().run(),
        current: $c => $c.querySelectorAll('#pages p').countAbove().run(),
        total: $c => $c.querySelectorAll('#pages p').length().run(),
      },
      {
        current: $c => $c.querySelectorAll('#pages img').countAbove().run(),
        total: $c => $c.querySelectorAll('#pages img').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('series').run(),
          $c.url().urlPart(4).matches('genre').boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().replaceAll('[Novel]', '').trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('h1').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#chapters a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.getAttribute('title').regex('chapter[ _-]?(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('#pages_panel').boolean().run()).trigger().run(); // locked chapter
    },
  },
};
