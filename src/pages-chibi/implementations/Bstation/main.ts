import { PageInterface } from '../../pageInterface';

type BStationContext = Parameters<PageInterface['sync']['getTitle']>[0];

const resolveBStationTitle = ($c: BStationContext) =>
  $c
    .coalesce(
      $c.fn($c.querySelector('.bstar-meta__title').ifNotReturn().text().trim().run()).run(),
      $c.fn($c.querySelector('.bstar-meta__ogv-title').ifNotReturn().text().trim().run()).run(),
      $c.fn($c.querySelector('.detail-header__title').ifNotReturn().text().trim().run()).run(),
      $c.fn($c.querySelector('[data-e2e="media-title"]').ifNotReturn().text().trim().run()).run(),
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
    )
    .trim()
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

const resolveBStationImage = ($c: BStationContext) =>
  $c.querySelector('meta[property="og:image"]').getAttribute('content').ifNotReturn().run();

const resolveBStationInitialStateScript = ($c: BStationContext) =>
  $c
    .querySelectorAll('script')
    .arrayFind($script => $script.text().includes('window.__initialState').run());

const hasBStationDataTagFlag = ($c: BStationContext) =>
  $c
    .coalesce(
      $c
        .fn(
          $c
            .querySelector('[data-e2e="media-tag"] [data-e2e="tag-name"]')
            .ifNotReturn()
            .text()
            .toLowerCase()
            .includes('anime')
            .run(),
        )
        .run(),
      $c.boolean(false).run(),
    )
    .run();

const hasBStationInitialStateAnimeFlag = ($c: BStationContext) =>
  $c
    .coalesce(
      $c
        .fn(
          resolveBStationInitialStateScript($c)
            .ifNotReturn()
            .text()
            .ifNotReturn()
            .matches('season_type\\s*[:=]\\s*"Anime"', 'i')
            .run(),
        )
        .run(),
      $c.boolean(false).run(),
    )
    .run();

const hasBStationKeywordAnimeFlag = ($c: BStationContext) =>
  $c
    .coalesce(
      $c
        .fn(
          $c
            .querySelector('meta[name="keywords"]')
            .ifNotReturn()
            .getAttribute('content')
            .ifNotReturn()
            .toLowerCase()
            .includes('anime')
            .run(),
        )
        .run(),
      $c.boolean(false).run(),
    )
    .run();

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
      $c.querySelector('.anime-tag').boolean().run(),
      hasBStationDataTagFlag($c),
      hasBStationInitialStateAnimeFlag($c),
      hasBStationKeywordAnimeFlag($c),
    )
    .run();

export const BStation: PageInterface = {
  name: 'BStation',
  type: 'anime',
  domain: 'https://www.bilibili.tv',
  languages: ['Indonesian', 'English', 'Thai', 'Vietnamese', 'Malay', 'Arabic'],
  urls: {
    match: ['*://www.bilibili.tv/*'],
  },
  search: 'https://www.bilibili.tv/search-result?q={searchterm}',
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
        .string('/media/<id>')
        .replace('<id>', $c.this('sync.getIdentifier').run())
        .urlAbsolute()
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
        .or($c.url().urlPart(4).equals('media').run(), $c.url().urlPart(3).equals('media').run())
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
