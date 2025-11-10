import { PageInterface } from '../../pageInterface';

export const Bstation: PageInterface = {
  name: 'Bstation',
  type: 'anime',
  domain: 'https://www.bilibili.tv',
  languages: ['Indonesian', 'English', 'Thai', 'Vietnamese', 'Malay', 'Arabic'],
  urls: {
    match: ['*://www.bilibili.tv/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(4).equals('play').run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c
            .querySelector('.bstar-meta__title')
            .ifNotReturn()
            .text()
            .trim()
            .log('bstation.sync.title.bstar-meta__title')
            .run(),
          $c
            .querySelector('.bstar-meta__ogv-title')
            .ifNotReturn()
            .text()
            .trim()
            .log('bstation.sync.title.bstar-meta__ogv-title')
            .run(),
          $c
            .querySelector('meta[property="og:title"]')
            .ifNotReturn()
            .getAttribute('content')
            .trim()
            .run(),
          $c.title().trim().run(),
        )
        .log('bstation.sync.title.result')
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    getOverviewUrl($c) {
      return $c
        .string('https://www.bilibili.tv/<lang>/media/<id>')
        .replace('<lang>', $c.url().urlPart(3).run())
        .replace('<id>', $c.this('sync.getIdentifier').run())
        .run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c
            .querySelector('.ep-item.ep-item--active')
            .ifNotReturn()
            .text()
            .regex('\\d+', 0)
            .number()
            .run(),
          $c
            .querySelector('.ep-list .ep-item.ep-item--active')
            .ifNotReturn()
            .text()
            .regex('\\d+', 0)
            .number()
            .run(),
          $c.string('0').run(),
        )
        .number()
        .run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(4).equals('media').run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c
            .querySelector('.bstar-meta__title')
            .ifNotReturn()
            .text()
            .trim()
            .log('bstation.overview.title.bstar-meta__title')
            .run(),
          $c
            .querySelector('.bstar-meta__ogv-title')
            .ifNotReturn()
            .text()
            .trim()
            .log('bstation.overview.title.bstar-meta__ogv-title')
            .run(),
          $c
            .querySelector('meta[property="og:title"]')
            .ifNotReturn()
            .getAttribute('content')
            .trim()
            .run(),
          $c.title().trim().run(),
        )
        .log('bstation.overview.title.result')
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(5).run();
    },
    uiInjection($c) {
      return $c
        .querySelector(
          'h1, [data-e2e="media-title"], .media-title, .media__title, .ogv-title, .title-h1',
        )
        .ifNotReturn()
        .uiAfter()
        .run();
    },
    getImage($c) {
      return $c
        .querySelector('meta[property="og:image"]')
        .getAttribute('content')
        .ifNotReturn()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.return().run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              // Have an identifier
              $c.this('sync.getIdentifier').boolean().run(),
              // Confirm content is anime via tag indicators
              $c
                .or(
                  $c.querySelector('.bstar-meta-tag.bstar-meta-tag--anime').boolean().run(),
                  $c.querySelector('[data-e2e="media-tag"] .bstar-meta-tag--anime').boolean().run(),
                  $c
                    .querySelector('[data-e2e="media-tag"] [data-e2e="tag-name"]')
                    .ifNotReturn()
                    .text()
                    .toLowerCase()
                    .includes('anime')
                    .run(),
                )
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.this('overview.getIdentifier').boolean().run(),
              $c
                .or(
                  $c.querySelector('.bstar-meta-tag.bstar-meta-tag--anime').boolean().run(),
                  $c.querySelector('[data-e2e="media-tag"] .bstar-meta-tag--anime').boolean().run(),
                  $c
                    .querySelector('[data-e2e="media-tag"] [data-e2e="tag-name"]')
                    .ifNotReturn()
                    .text()
                    .toLowerCase()
                    .includes('anime')
                    .run(),
                )
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};
