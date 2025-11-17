import { PageInterface } from '../../pageInterface';

type BStationContext = Parameters<PageInterface['sync']['getTitle']>[0];

const resolveBStationTitle = ($c: BStationContext) =>
  $c
    .coalesce(
      $c.fn($c.querySelector('.bstar-meta__title').ifNotReturn().text().trim().run()).run(),
      $c.fn($c.querySelector('.bstar-meta__ogv-title').ifNotReturn().text().trim().run()).run(),
      $c
        .fn(
          $c
            .querySelector('meta[property="og:title"]')
            .ifNotReturn()
            .getAttribute('content')
            .trim()
            .run(),
        )
        .run(),
      $c.title().trim().run(),
    )
    .run();

const resolveBStationIdentifier = ($c: BStationContext) =>
  $c
    .if(
      $c.url().urlPart(4).equals('play').run(),
      $c.url().urlPart(5).run(),
      $c
        .if(
          $c.url().urlPart(3).equals('play').run(),
          $c.url().urlPart(4).run(),
          $c
            .if(
              $c.url().urlPart(4).equals('media').run(),
              $c.url().urlPart(5).run(),
              $c.url().urlPart(4).run(),
            )
            .run(),
        )
        .run(),
    )
    .run();

const hasBStationLanguageSegment = ($c: BStationContext) =>
  $c.or($c.url().urlPart(4).equals('play').run(), $c.url().urlPart(4).equals('media').run()).run();

const resolveBStationImage = ($c: BStationContext) =>
  $c.querySelector('meta[property="og:image"]').getAttribute('content').ifNotReturn().run();

const hasBStationAnimeTag = ($c: BStationContext) =>
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
    .run();

export const bStation: PageInterface = {
  name: 'BStation',
  type: 'anime',
  domain: 'https://www.bilibili.tv',
  languages: ['Indonesian', 'English', 'Thai', 'Vietnamese', 'Malay', 'Arabic'],
  urls: {
    match: ['*://www.bilibili.tv/*'],
  },
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c
            .or($c.url().urlPart(4).equals('play').run(), $c.url().urlPart(3).equals('play').run())
            .run(),
          hasBStationAnimeTag($c),
        )
        .run();
    },
    getTitle($c) {
      return resolveBStationTitle($c);
    },
    getIdentifier($c) {
      return resolveBStationIdentifier($c);
    },
    getOverviewUrl($c) {
      return $c
        .if(
          hasBStationLanguageSegment($c),
          $c
            .string('/<lang>/media/<id>')
            .replace('<lang>', $c.url().urlPart(3).run())
            .replace('<id>', $c.this('sync.getIdentifier').run())
            .urlAbsolute()
            .run(),
          $c
            .string('/media/<id>')
            .replace('<id>', $c.this('sync.getIdentifier').run())
            .urlAbsolute()
            .run(),
        )
        .run();
    },
    getEpisode($c) {
      return $c
        .querySelector('.ep-item.ep-item--active')
        .ifNotReturn()
        .text()
        .regex('\\d+', 0)
        .number()
        .run();
    },
    getImage($c) {
      return resolveBStationImage($c);
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c
            .or(
              $c.url().urlPart(4).equals('media').run(),
              $c.url().urlPart(3).equals('media').run(),
            )
            .run(),
          hasBStationAnimeTag($c),
        )
        .run();
    },
    getTitle($c) {
      return resolveBStationTitle($c);
    },
    getIdentifier($c) {
      return resolveBStationIdentifier($c);
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
      return resolveBStationImage($c);
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
