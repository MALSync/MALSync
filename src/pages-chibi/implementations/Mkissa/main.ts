import { PageInterface } from '../../pageInterface';

export const Mkissa: PageInterface = {
  name: 'Mkissa',
  type: 'manga',
  domain: 'https://mkissa.to',
  languages: ['English'],
  urls: {
    match: ['*://mkissa.to/*'],
  },
  search: 'https://mkissa.to/search/manga?query={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).matches('^chapter-').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .querySelector('title')
        .text()
        .replaceRegex('\\s*[^\\w\\s]\\s*MKissa\\s*$', '')
        .replaceRegex('\\s+Ch\\.?\\s*[\\d.]+\\s*$', '')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c.url().replaceRegex('/[^/]+$', '').run();
    },
    getEpisode($c) {
      return $c.url().urlPart(5).regex('chapter-(\\d+)', 1).number().run();
    },
    readerConfig: [
      {
        current: $c =>
          $c.querySelector('.reader__page-number-current').ifNotReturn().text().number().run(),
        total: $c =>
          $c.querySelector('.reader__page-number-total').ifNotReturn().text().number().run(),
      },
    ],
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
      return $c.querySelector('.anime-detail__title').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('.anime-detail__banner-img')
        .ifNotReturn()
        .getAttribute('src')
        .ifNotReturn()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          anilistId: $c
            .querySelector('.anime-detail__banner-img[src*="anilistcdn"]')
            .ifNotReturn()
            .getAttribute('src')
            .ifNotReturn()
            .regex('anilistcdn/media/(?:anime|manga)/[a-z]+/(\\d+)-', 1)
            .number()
            .ifNotReturn()
            .run(),
        })
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('.anime-detail__head').uiAfter().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .detectChanges($c.querySelector('title').ifNotReturn().text().run(), $c.trigger().run())
        .trigger()
        .run();
    },
  },
};
