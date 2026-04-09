import { PageInterface } from '../../pageInterface';

export const ZonaTMO: PageInterface = {
  name: 'ZonaTMO',
  domain: 'https://zonatmo.to',
  languages: ['Spanish'],
  type: 'manga',
  urls: {
    match: ['*://zonatmo.to/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#ctrl-menu div.head a').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c
        .querySelector('b.current-type-number')
        .text()
        .trim()
        .regex('(\\d+(?:\\.\\d+)?)', 1)
        .number()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('aside.content div.info h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('aside.content section.m-list').uiBefore().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('section.m-list div.list-body ul li a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .querySelector('p')
        .text()
        .trim()
        .regex('(\\d+(?:\\.\\d+)?)', 1)
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
  },
};
