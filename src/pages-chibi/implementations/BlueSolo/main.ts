import { PageInterface } from '../../pageInterface';

export const BlueSolo: PageInterface = {
  name: 'BlueSolo',
  domain: 'https://bluesolo.org',
  languages: ['French'],
  type: 'manga',
  urls: {
    match: ['*://bluesolo.org/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('read').run();
    },
    getTitle($c) {
      return $c.querySelector('.comic-title').text().trim().ifNotReturn().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.comic-title')
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().regex('/ch/(\\d+)', 1).ifNotReturn().number().run();
    },
    getVolume($c) {
      return $c.url().regex('/vol/(\\d+)', 1).ifNotReturn().number().run();
    },
    nextEpUrl($c) {
      // On the last chapter the arrow links back to the overview instead
      return $c
        .querySelector('#chapter-link-right')
        .getAttribute('href')
        .ifNotReturn()
        .regex('/read/.*', 0)
        .ifNotReturn($c.boolean(false).run())
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('comics').run();
    },
    getTitle($c) {
      return $c
        .querySelector('#comic > div:nth-child(1) > div.card-header')
        .text()
        .trim()
        .ifNotReturn()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('.thumbnail-full img')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('#comic .card.mt-3 > .card-body').uiPrepend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('#comic .item').run();
    },
    elementUrl($c) {
      return $c.find('.filter').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .find('.filter')
        .getAttribute('href')
        .regex('/ch/(\\d+)', 1)
        .ifNotReturn()
        .number()
        .run();
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
      return $c.waitUntilTrue($c.querySelector('.comic-title').boolean().run()).trigger().run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('#comic .item').boolean().run()).trigger().run();
    },
  },
};
