import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const AnimeStream: PageInterface = {
  name: 'AnimeStream',
  type: 'anime',
  domain: ['https://anime.uniquestream.net'],
  languages: ['English', 'Malay', 'Indonesian', 'Japanese'],
  urls: {
    match: ['*://*.uniquestream.net/*'],
  },
  features: {
    requestProxy: true,
  },
  search: 'https://anime.uniquestream.net/search?q={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('watch').run();
    },
    getTitle($c) {
      const seriesTitle = $c
        .querySelector('div.mp-watch-ep-main > a.mp-watch-series')
        .ifNotReturn($c.querySelector('h1.mp-watch-title').text().trim().run())
        .text()
        .trim()
        .string();
      const seasonLabel = getSeasonName($c);
      const seasonTitle = $c
        .if(
          seasonLabel.toLowerCase().contains(seriesTitle.toLowerCase().run()).run(),
          seasonLabel.run(),
          seriesTitle.concat(' ').concat(seasonLabel.replace('Season 1', '').run()).trim().run(),
        )
        .run();

      return seasonTitle;
    },
    getIdentifier($c) {
      const fistEpisodeId = $c
        .querySelector('div.mp-wel-grid > .mp-wel-cell')
        .ifNotReturn()
        .getAttribute('href')
        .setVariable('epUrl')
        .if(
          $c.getVariable('epUrl').equals(null).run(),
          $c.url().urlPart(4).run(),
          $c.getVariable('epUrl').string().urlPart(2).run(),
        )
        .run();

      return $c
        .querySelector('div.mp-watch-ep-main > a.mp-watch-series')
        .ifNotReturn($c.url().urlPart(4).run())
        .getAttribute('href')
        .urlPart(2)
        .concat('_')
        .concat(fistEpisodeId)
        .run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('div.mp-watch-ep-main > a.mp-watch-series')
        .ifNotReturn($c.url().replace('/watch/', '/movies/').run())
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .if(
          $c
            .querySelector('h1.mp-watch-title')
            .text()
            .trim()
            .setVariable('title')
            .matches('e(\\d+)\\s-\\s', 'im')
            .run(),
          $c.getVariable('title').string().regex('e(\\d+)\\s-\\s', 1, 'im').number().run(),
          $c.number(NaN).run(),
        )
        .run();
    },
    nextEpUrl($c) {
      return $c
        .querySelector('div.mp-watch-np > a:nth-child(1)')
        .ifNotReturn()
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malId: $c
            .getGlobalVariable($c.string('malId_').concat($c.url().urlPart(4).run()).run())
            .number()
            .ifNotReturn()
            .run(),
        })
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .or($c.url().urlPart(3).equals('series').run(), $c.url().urlPart(3).equals('movies').run())
        .run();
    },
    getTitle($c) {
      const movieTitle = $c.if(
        $c.url().urlPart(3).equals('movies').run(),
        $c.querySelector('h1.mp-mv-title').text().trim().run(),
        $c.boolean(false).run(),
      );
      const seriesTitle = $c.querySelector('h1.mp-sr-title').text().trim();
      const fistEpisodeId = $c
        .querySelector('div.mp-sr-epgrid > a')
        .getAttribute('href')
        .urlPart(2)
        .run();
      const seasonId = $c
        .getGlobalVariable($c.string('seasonId_').concat(fistEpisodeId).run())
        .run();
      const seasonLabel = $c.getGlobalVariable($c.string('title_').concat(seasonId).run()).string();
      const seasonTitle = $c
        .if(
          seasonLabel.toLowerCase().contains(seriesTitle.toLowerCase().run()).run(),
          seasonLabel.run(),
          seriesTitle.concat(' ').concat(seasonLabel.replace('Season 1', '').run()).trim().run(),
        )
        .run();

      return movieTitle.ifNotReturn(seasonTitle).string().run();
    },
    getIdentifier($c) {
      const movieIdentifier = $c.if(
        $c.url().urlPart(3).equals('movies').run(),
        $c.url().urlPart(4).run(),
        $c.boolean(false).run(),
      );
      const seriesId = $c.url().urlPart(4);
      const fistEpisodeId = $c
        .querySelector('div.mp-sr-epgrid > a')
        .getAttribute('href')
        .urlPart(2)
        .run();

      return movieIdentifier
        .ifNotReturn(seriesId.concat('_').concat(fistEpisodeId).run())
        .string()
        .run();
    },
    uiInjection($c) {
      const movieUi = $c.if(
        $c.url().urlPart(3).equals('movies').run(),
        $c.querySelector('div.mp-mv-actionzone').uiBefore().run(),
        $c.boolean(false).run(),
      );
      const seriesUi = $c.querySelector('div.mp-sr-actionzone > div.mp-sr-actions').uiAfter().run();

      return movieUi.ifNotReturn(seriesUi).run();
    },
    getImage($c) {
      const movieImageUrl = $c.if(
        $c.url().urlPart(3).equals('movies').run(),
        $c.querySelector('div.mp-mv-poster img').ifNotReturn().getAttribute('src').run(),
        $c.boolean(false).run(),
      );
      const seriesImageUrl = $c
        .querySelector('div.mp-sr-poster img')
        .ifNotReturn()
        .getAttribute('src')
        .run();

      return movieImageUrl.ifNotReturn(seriesImageUrl).string().run();
    },
    getMalUrl($c) {
      const fistEpisodeId = $c
        .querySelector('div.mp-sr-epgrid > a')
        .getAttribute('href')
        .urlPart(2)
        .run();
      const seasonId = $c
        .getGlobalVariable($c.string('seasonId_').concat(fistEpisodeId).run())
        .run();
      const malId = $c
        .providerUrlUtility({
          malId: $c
            .getGlobalVariable($c.string('malId_').concat(seasonId).run())
            .number()
            .ifNotReturn()
            .run(),
        })
        .run();

      return $c.url().urlPart(3).equals('movies').ifNotReturn(malId).boolean(false).run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c
        .if(
          $c.querySelectorAll('div.mp-sr-epgrid > a[href^="/watch/"]').length().boolean().run(),
          $c.querySelectorAll('div.mp-sr-epgrid > a[href^="/watch/"]').run(),
          $c.querySelectorAll('div.mp-wel-grid > a.mp-wel-cell[href^="/watch/"]').run(),
        )
        .run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .find('span.mp-ep-stamp')
        .ifNotReturn($c.number(NaN).run())
        .text()
        .trim()
        .setVariable('title')
        .if(
          $c.getVariable('title').string().matches('e(\\d+)', 'im').run(),
          $c.getVariable('title').string().regex('e(\\d+)', 1, 'im').number().run(),
          $c.number(NaN).run(),
        )
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .requestProxy($d =>
          $d
            .setVariable('request')
            .get('url')
            .setVariable('requestUrl')
            .or(
              $d
                .getVariable('requestUrl')
                .string()
                .matches('\\/api\\/v1\\/content\\/')
                .setVariable('requestType', $d.string('content').run())
                .run(),
              $d
                .getVariable('requestUrl')
                .string()
                .matches('\\/api\\/v1\\/(series|movie)\\/')
                .setVariable('requestType', $d.string('series').run())
                .run(),
              $d
                .getVariable('requestUrl')
                .string()
                .matches('\\/api\\/v1\\/season\\/.+\\/episodes\\?page\\=1')
                .setVariable('requestType', $d.string('episodes').run())
                .run(),
              $d
                .getVariable('requestUrl')
                .string()
                .matches('\\/(series|movies)\\/.+\\/_payload\\.json')
                .setVariable('requestType', $d.string('payload').run())
                .run(),
            )
            .ifThen($e => $e.exec(handleJsonRequest).run())
            .run(),
        )
        .detectURLChanges($c.url().log('url changes trigger').trigger().run())
        .detectChanges(
          $c.querySelector('span.mp-sr-season-cur').ifNotReturn().text().run(),
          $c.log('season change trigger').trigger().run(),
        )
        .detectChanges(
          $c.querySelector('nav.mp-watch-crumbs').ifNotReturn().text().run(),
          $c.log('1st ep change trigger').trigger().run(),
        )
        .domReady()
        .log('domReady trigger')
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .or(
              $c
                .and(
                  $c.querySelector('div.mp-wsa').boolean().run(),
                  $c.querySelector('div.mp-wel-grid > .mp-wel-cell').boolean().run(),
                )
                .run(),
              $c.querySelector('div.mp-watch-actions').boolean().run(),
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
            .or(
              $c
                .and(
                  $c.querySelector('div.mp-sr-actionzone > div.mp-sr-actions').boolean().run(),
                  $c.querySelector('div.mp-sr-epgrid > a').boolean().run(),
                )
                .run(),
              $c
                .and(
                  $c.querySelector('div.mp-mv-actionzone > a.mp-mv-cta').boolean().run(),
                  $c.url().urlPart(3).equals('movies').run(),
                )
                .run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .waitUntilTrue(
          $c
            .or(
              $c.querySelector('div.mp-sr-epgrid > a').boolean().run(),
              $c.querySelector('div.mp-wel-grid > a.mp-wel-cell').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .detectChanges(
          $c.querySelector('div.mp-wel-grid').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .detectChanges(
          $c.querySelectorAll('div.mp-sr-epgrid').last().ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

function getSeasonName($c: ChibiGenerator<unknown>) {
  return $c
    .querySelector('span.mp-watch-meta-item:nth-child(2)')
    .ifNotReturn()
    .text()
    .trim()
    .string();
}

function handleJsonRequest($c: ChibiGenerator<unknown>) {
  return $c.if(
    $c
      .getVariable('request')
      .get('data')
      .setVariable('requestData')
      .getVariable('requestUrl')
      .string()
      .log('handleJsonRequest')
      .matches('\\/_payload\\.json')
      .run(),
    $c.exec(arrayMetadata).run(),
    $c.exec(objectMetadata).run(),
  );
}

function arrayMetadata($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('requestData')
    .log('arrayMetadata')
    .search('seasons')
    .setVariable('curIndex')
    .getVariable('requestData')
    .get($c.getVariable('curIndex').run())
    .values()
    .map($item =>
      $item
        .setVariable('curIndex')
        .getVariable('requestData')
        .get($c.getVariable('curIndex').run())
        .setVariable('curObject')
        .get('content_id')
        .setVariable('curIndex')
        .getVariable('requestData')
        .get($c.getVariable('curIndex').run())
        .setVariable('seasonId')
        .getVariable('curObject')
        .get('mal_id')
        .setVariable('curIndex')
        .getVariable('requestData')
        .get($c.getVariable('curIndex').run())
        .setGlobalVariable($c.string('malId_').concat($item.getVariable('seasonId').run()).run())
        .log('malId')
        .getVariable('curObject')
        .get('title')
        .setVariable('curIndex')
        .getVariable('requestData')
        .get($c.getVariable('curIndex').run())
        .setGlobalVariable($c.string('title_').concat($item.getVariable('seasonId').run()).run())
        .log('title')
        .run(),
    );
}

function objectMetadata($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('requestType')
    .equals('episodes')
    .ifThen($d =>
      $d
        .getVariable('requestData')
        .log('episodes')
        .get('0')
        .get('content_id')
        .setVariable('episodeId')
        .getVariable('requestUrl')
        .string()
        .urlPart(6)
        .setGlobalVariable(
          $d.string('seasonId_').concat($d.getVariable('episodeId').string().run()).run(),
        )
        .log('seasonId')
        .run(),
    )
    .getVariable('requestType')
    .equals('content')
    .ifThen($d =>
      $d
        .getVariable('requestData')
        .log('content')
        .get('content_id')
        .setVariable('episodeId')
        .getVariable('requestData')
        .get('mal_id')
        .setGlobalVariable(
          $d.string('malId_').concat($d.getVariable('episodeId').string().run()).run(),
        )
        .log('malId')
        .run(),
    )
    .getVariable('requestType')
    .equals('series')
    .ifThen($d =>
      $d
        .getVariable('requestData')
        .log('series')
        .get('seasons')
        .values()
        .map($item =>
          $item
            .setVariable('curObject')
            .search('content_id')
            .setVariable('seasonId')
            .getVariable('curObject')
            .get('title')
            .setGlobalVariable(
              $item.string('title_').concat($item.getVariable('seasonId').run()).run(),
            )
            .log('title')
            .getVariable('curObject')
            .get('mal_id')
            .setGlobalVariable(
              $item.string('malId_').concat($item.getVariable('seasonId').run()).run(),
            )
            .log('malId')
            .run(),
        )
        .run(),
    );
}
