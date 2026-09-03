import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

type SeriesMetadata = {
  id: number;
  genres: { id: number }[];
  origin_country: string[];
};

export const FlixMomo: PageInterface = {
  name: 'Flixmomo',
  domain: 'https://flixmomo.app',
  languages: ['English'],
  type: 'anime',
  features: {
    requestProxy: true,
  },
  urls: {
    match: ['*://*.flixmomo.app/*'],
    player: {
      vidsrc: ['*://vsembed.su/*', '*://cloudorchestranova.com/*'],
      vidcore: ['*://vidcore.net/*'],
      videasy: ['*://player.videasy.to/*'],
      mapple: ['*://mapple.rip/*'],
      vidbolt: ['*://vidbolt.xyz/*'],
      cinemaos: ['*://cinemaos.tech/*'],
      zxcstream: ['*://*.zxcstream.xyz/*'],
      peachify: ['*://peachify.top/*'],
      xpass: ['*://play.xpass.top/*'],
      oneembed: ['*://1embed.cc/*'],
      multiembed: ['*://multiembed.mov/*', '*://*.streamingnow.mov/*'],
      vidfast: ['*://vidfast.vc/*'],
    },
  },
  search: 'https://flixmomo.app/search?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('tv').run(),
          $c.url().urlPart(6).equals('season').run(),
          $c.url().urlPart(7).boolean().run(),
          $c.url().urlParam('e').boolean().run(),
          isAnime($c).run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .title()
        .regex('^Watch (.+) - Free Episodes', 1)
        .replaceRegex(' Season 1$', '')
        .trim()
        .run();
    },
    getIdentifier($c) {
      return getIdentifier($c).run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 6).join('/').run();
    },
    getEpisode($c) {
      return $c.url().urlParam('e').number().run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('tv').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(6).boolean().not().run(),
          isAnime($c).run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('main h4').text().trim().run();
    },
    getIdentifier($c) {
      return getIdentifier($c).run();
    },
    getImage($c) {
      return $c.querySelector('main img.poster-img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('main h4').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('main button[data-episode]').run();
    },
    elementUrl($c) {
      const episode = $c.target().getAttribute('data-episode').number().string();

      return $c.url().split('?').first().concat('?e=').concat(episode.run()).concat('&p=1').run();
    },
    elementEp($c) {
      return $c.getAttribute('data-episode').number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .requestProxy($request => handleRequest($request).run())
        .detectChanges(isAnime($c).run(), $c.trigger().run())
        .detectURLChanges($c.trigger().run())
        .domReady()
        .trigger()
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.querySelector('main h1').boolean().run(),
              $c.title().contains(' - Free Episodes').run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
    overviewIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('main h4').boolean().run()).trigger().run();
    },
  },
};

function getIdentifier($c: ChibiGenerator<unknown>) {
  const season = $c.if(
    $c.url().urlPart(7).boolean().run(),
    $c.url().urlPart(7).run(),
    $c.string('1').run(),
  );

  return $c.url().urlPart(4).concat('-season-').concat(season.string().run());
}

function handleRequest($c: ChibiGenerator<{ url: string; data: SeriesMetadata }>) {
  return $c
    .values()
    .type<SeriesMetadata[]>()
    .filter(data => data.get('id').string().equals($c.url().urlPart(4).run()).run())
    .filter(data => data.get('genres').boolean().run())
    .filter(data => data.get('origin_country').boolean().run())
    .first()
    .ifNotReturn()
    .setGlobalVariable($c.string('flixMomoSeries:').concat($c.url().urlPart(4).run()).run());
}

function isAnime($c: ChibiGenerator<unknown>) {
  const metadata = $c.getGlobalVariable<SeriesMetadata>(
    $c.string('flixMomoSeries:').concat($c.url().urlPart(4).run()).run(),
    { id: 0, genres: [], origin_country: [] },
  );

  return $c.and(
    metadata.get('id').string().equals($c.url().urlPart(4).run()).run(),
    metadata.get('genres').boolean().run(),
    metadata
      .get('genres')
      .arrayFind(genre => genre.get('id').equals(16).run()) // 16 is animation
      .boolean()
      .run(),
    metadata.get('origin_country').boolean().run(),
    metadata.get('origin_country').arrayIncludes('JP').run(), // animation + japan = anime?
  );
}
