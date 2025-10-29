import type { PageInterface } from '../../pageInterface';

export const SakuraMangas: PageInterface = {
  name: 'SakuraMangas',
  domain: 'https://sakuramangas.org',
  languages: ['Portuguese'],
  type: 'manga',
  urls: {
    match: ['*://*.sakuramangas.org/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('obras').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#id-titulo').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/obras/')
        .concat($c.this('sync.getIdentifier').run())
        .concat('/')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).number().run();
    },
    getImage($c) {
      return $c
        .string('/obras/')
        .concat($c.this('sync.getIdentifier').run())
        .concat('/thumb_256.jpg')
        .urlAbsolute()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('obras').run(), $c.url().urlPart(5).boolean().not().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1.h1-titulo').text().trim().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    uiInjection($c) {
      return $c.querySelector('.col-xxl-10').uiAfter().run();
    },
    getImage($c) {
      return $c
        .string('/obras/')
        .concat($c.this('sync.getIdentifier').run())
        .concat('/thumb_256.jpg')
        .urlAbsolute()
        .run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.chapter-item').run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').urlPart(5).number().run();
    },
    elementUrl($c) {
      return $c.find('a').ifNotReturn().getAttribute('href').urlAbsolute().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .title()
        .contains('404')
        .ifThen($c => $c.string('404').log().return().run())
        .detectURLChanges($c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges($c.querySelectorAll('.chapter-item').length().run(), $c.trigger().run())
        .run();
    },
  },
};
