import { PageInterface } from '../../pageInterface';

type UNextContext = Parameters<PageInterface['sync']['getTitle']>[0];

const digitEpisodePattern = '(?:第|#|EP)\\s*([0-9０-９]+)(?:話)?';
const japaneseEpisodePattern = '第\\s*([零〇一二三四五六七八九十百千万億兆]+)\\s*話';
const titleId = ($c: UNextContext) =>
  $c
    .coalesce(
      $c.fn($c.url().urlParam('td').ifNotReturn().run()).run(),
      $c.fn($c.url().urlPart(4).run()).run(),
    )
    .ifNotReturn();

const playerHeader = ($c: UNextContext) =>
  $c.querySelector('[data-testid="player-header-back"]').ifNotReturn().parent();

const playerTitle = ($c: UNextContext) =>
  playerHeader($c).ifNotReturn().find('h2').ifNotReturn().text().trim();

const playerEpisodeTitle = ($c: UNextContext) =>
  playerHeader($c).ifNotReturn().find('h3').ifNotReturn().text().trim();

const hasPlayerEpisodeTitle = ($c: UNextContext) => playerHeader($c).find('h3').boolean();

const overviewTitle = ($c: UNextContext) =>
  $c
    .coalesce(
      $c
        .fn(
          $c
            .querySelector('[data-testid="videoStageMain-title-text"]')
            .ifNotReturn()
            .text()
            .trim()
            .run(),
        )
        .run(),
      $c
        .fn(
          $c
            .querySelector('meta[property="og:title"]')
            .ifNotReturn()
            .getAttribute('content')
            .replaceRegex('\\(アニメ\\s*/\\s*\\d+\\).*$', '')
            .trim()
            .run(),
        )
        .run(),
    )
    .run();

const image = ($c: UNextContext) =>
  $c
    .querySelector('meta[property="og:image"]')
    .ifNotReturn()
    .getAttribute('content')
    .ifNotReturn()
    .run();

const isAnimeTitlePage = ($c: UNextContext) =>
  $c
    .and(
      $c.url().urlPart(3).equals('title').run(),
      $c.url().urlPart(4).matches('^SID').run(),
      $c.querySelector('a[href*="mgc=ANIME"]').boolean().run(),
    )
    .run();

const hasTitleModal = ($c: UNextContext) =>
  $c
    .and(
      $c.url().urlParam('td').ifNotReturn().matches('^SID').run(),
      $c.querySelector('[data-testid="TitleModal"]').boolean().run(),
      $c.querySelector('[data-testid="videoStageMain-title-text"]').boolean().run(),
      $c.querySelector('[data-testid="TitleModal"] a[href*="mgc=ANIME"]').boolean().run(),
    )
    .run();

const missing = ($c: UNextContext) => $c.object({}).get('missing').run();

const episodeNumber = ($c: UNextContext, input: ReturnType<typeof playerEpisodeTitle>) =>
  $c
    .coalesce(
      $c
        .fn(
          $c
            .if(
              input.normalize().matches(digitEpisodePattern).run(),
              input.normalize().regex(digitEpisodePattern, 1).number().run(),
              missing($c),
            )
            .run(),
        )
        .run(),
      $c
        .fn(
          $c
            .if(
              input.matches(japaneseEpisodePattern).run(),
              input.regex(japaneseEpisodePattern, 1).JPtoNumeral().number().run(),
              missing($c),
            )
            .run(),
        )
        .run(),
    )
    .run();

export const UNext: PageInterface = {
  name: 'U-NEXT',
  type: 'anime',
  domain: 'https://video.unext.jp',
  languages: ['Japanese'],
  urls: {
    match: ['*://video.unext.jp/*'],
  },
  search: 'https://video.unext.jp/freeword?query={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('play').run(),
          $c.url().urlPart(4).matches('^SID').run(),
          $c.url().urlPart(5).matches('^ED').run(),
        )
        .run();
    },
    getTitle($c) {
      return playerTitle($c).run();
    },
    getIdentifier($c) {
      return titleId($c).run();
    },
    getOverviewUrl($c) {
      return $c.string('/title/<id>').replace('<id>', titleId($c).run()).urlAbsolute().run();
    },
    getEpisode($c) {
      return $c
        .if(
          hasPlayerEpisodeTitle($c).run(),
          episodeNumber($c, playerEpisodeTitle($c)),
          $c.number(1).run(),
        )
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c.or(isAnimeTitlePage($c), hasTitleModal($c)).run();
    },
    getTitle($c) {
      return overviewTitle($c);
    },
    getIdentifier($c) {
      return titleId($c).run();
    },
    uiInjection($c) {
      return $c
        .querySelector('[data-testid="videoStageMain-title-text"]')
        .ifNotReturn()
        .uiAfter()
        .run();
    },
    getImage($c) {
      return image($c);
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('[data-testid="videoDetail-episodeList-episodeDetail"]').run();
    },
    elementUrl($c) {
      return $c
        .find('a[data-testid="stackedVideo-title-link"]')
        .ifNotReturn()
        .getAttribute('href')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    elementEp($c) {
      return episodeNumber($c as unknown as UNextContext, $c.ifNotReturn().text().trim());
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .detectURLChanges($c.trigger().run(), { ignoreQuery: false, ignoreAnchor: true })
        .detectChanges($c.title().run(), $c.trigger().run())
        .detectChanges(
          $c
            .querySelectorAll(
              '[data-testid="videoStageMain-title-text"], [data-testid="player-header-back"]',
            )
            .length()
            .run(),
          $c.trigger().run(),
        )
        .detectChanges(
          $c
            .querySelectorAll('[data-testid="videoDetail-episodeList-episodeDetail"]')
            .length()
            .run(),
          $c.trigger().run(),
        )
        .domReady()
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('[data-testid="videoStageMain-title-text"]').boolean().run(),
              $c.this('overview.getTitle').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c.and(playerTitle($c).boolean().run(), $c.this('sync.getEpisode').boolean().run()).run(),
        )
        .trigger()
        .run();
    },
  },
};
