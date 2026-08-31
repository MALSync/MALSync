import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

export const FlixMomo: PageInterface = {
  name: 'FlixMomo',
  domain: 'https://flixmomo.app',
  languages: ['English'],
  type: 'anime',
  urls: {
    match: ['*://flixmomo.app/*'],
    player: {
      vidsrc: ['*://vsembed.su/*', '*://cloudorchestranova.com/*'],
      vidcore: ['*://vidcore.net/*'],
      videasy: ['*://player.videasy.to/*'],
      mapple: ['*://mapple.rip/*'],
      vidbolt: ['*://vidbolt.xyz/*'],
      cinemaos: ['*://cinemaos.tech/*'],
      zxcstream: ['*://zxcstream.xyz/*'],
      peachify: ['*://peachify.top/*'],
      xpass: ['*://play.xpass.top/*'],
      oneembed: ['*://1embed.cc/*'],
      multiembed: ['*://multiembed.mov/*'],
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
        )
        .run();
    },
    getTitle($c) {
      return $c.title().regex('^Watch (.+) - Free Episodes', 1).trim().run();
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
        )
        .run();
    },
    getTitle($c) {
      return $c.querySelector('main h4').text().trim().concat(' Season 1').run();
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
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    syncIsReady($c) {
      return $c.waitUntilTrue($c.querySelector('main h1').boolean().run()).trigger().run();
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
