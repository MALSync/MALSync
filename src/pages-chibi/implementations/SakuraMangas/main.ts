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
      // Reading page follows pattern: /obras/{slug}/{number}/
      return $c
        .and($c.url().urlPart(3).equals('obras').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('#id-titulo').text().trim().run();
    },
    getIdentifier($c) {
      // Manga slug from URL (part 4)
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      // Build overview URL: /obras/{identifier}/
      return $c
        .string('/obras/')
        .concat($c.this('sync.getIdentifier').run())
        .concat('/')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      // Chapter number is in URL part 5
      return $c.url().urlPart(5).number().run();
    },
    getImage($c) {
      // Construct image URL from identifier
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
      // Overview page has 'obras' but no chapter number (urlPart 5 is empty)
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
      // Inject UI after the first col-xxl-10 element
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
      // Selector for chapter list items
      return $c.querySelectorAll('.chapter-item').run();
    },
    elementEp($c) {
      // Extract chapter number from URL
      return $c.this('list.elementUrl').urlPart(5).number().run();
    },
    elementUrl($c) {
      // Get full chapter URL
      return $c.find('a').getAttribute('href').urlAbsolute().run();
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
