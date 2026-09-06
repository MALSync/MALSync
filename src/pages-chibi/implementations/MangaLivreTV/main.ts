import { PageInterface } from '../../pageInterface';

export const MangaLivreTV: PageInterface = {
  name: 'MangaLivreTV',
  domain: 'https://mangalivre.tv',
  languages: ['Portuguese'],
  type: 'manga',
  urls: {
    match: ['*://mangalivre.tv/*'],
  },
  search: 'https://mangalivre.tv/?s={searchtermPlus}&post_type=wp-manga',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().run(),
          $c.url().urlPart(5).matches('capitulo[_-]?').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.breadcrumb a[href*="/manga/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c.querySelector('[property="og:image"]').getAttribute('content').ifNotReturn().run();
    },
    getOverviewUrl($c) {
      return $c
        .string('/manga/<identifier>')
        .replace('<identifier>', $c.url().this('sync.getIdentifier').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('capitulo[_-]?(\\d+)', 1).number().ifNotReturn().run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('#single-pager').boolean().run(),
        current: $c =>
          $c
            .querySelector('#single-pager')
            .selectedText()
            .regex('(\\d+)/(\\d+)$', 1)
            .number()
            .run(),
        total: $c =>
          $c
            .querySelector('#single-pager option')
            .text()
            .trim()
            .regex('(\\d+)/(\\d+)$', 2)
            .number()
            .run(),
      },
      {
        current: $c => $c.querySelectorAll('.reading-content img').countAbove().run(),
        total: $c => $c.querySelectorAll('.reading-content img').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('h1').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('.summary_image img').getAttribute('src').log().ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.post-content').uiAppend().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.listing-chapters_wrap .wp-manga-chapter').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').urlAbsolute().run();
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
