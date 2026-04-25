/* eslint-disable @typescript-eslint/no-use-before-define */
import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import type { PageInterface } from '../../pageInterface';

export const animeLib: PageInterface = {
  name: 'AnimeLib',
  type: 'anime',
  domain: ['https://v3.animelib.org'],
  languages: ['Russian'],
  urls: {
    match: ['*://*.animelib.org/*'],
  },
  search: 'https://v3.animelib.org/ru/catalog?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(6).boolean().run(), $c.url().urlPart(4).equals('anime').run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.page h1').text().trim().run();
    },
    getIdentifier($c) {
      const slug = $c.url().urlPart(5);
      const id = slug.string().regex('(\\d+)', 1);
      return id.run();
    },
    getOverviewUrl($c) {
      const slug = $c.url().urlPart(5);
      return $c.string('ru/anime/_URL_SLUG_').replace('_URL_SLUG_', slug.run()).urlAbsolute().run();
    },
    getEpisode($c) {
      const btnEp = getCurrentEpisodeBtn($c);
      return btnEp.ifNotReturn().text().split(' ').at(0).number().run();
    },
    getImage($c) {
      return $c.querySelector('._container .cover img').getAttribute('src').ifNotReturn().run();
    },
    nextEpUrl($c) {
      const btnEp = getCurrentEpisodeBtn($c);
      const slug = $c.url().urlPart(5);
      const next = btnEp
        .ifNotReturn()
        .next()
        .ifNotReturn()
        .getAttribute('data-scroll-id')
        .setVariable('nextEp')
        .string('ru/anime/_URL_SLUG_/watch?episode=_EP_ID_')
        .replace('_EP_ID_', $c.getVariable('nextEp').run())
        .replace('_URL_SLUG_', slug.run())
        .urlAbsolute();

      return next.run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and($c.url().urlPart(6).boolean().not().run(), $c.url().urlPart(4).equals('anime').run())
        .run();
    },
    getTitle($c) {
      const nameRu = $c.querySelector('.page h1');
      const nameAlt = $c.querySelector('.page h2');
      return $c.coalesce(nameAlt.run(), nameRu.run()).ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      const slug = $c.url().urlPart(5);
      const id = slug.string().regex('(\\d+)', 1);
      return id.run();
    },
    getImage($c) {
      return $c.querySelector('.cover img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.tabs._border').uiBefore().run();
    },
    getMalUrl($c) {
      const malID = $c
        .querySelectorAll('.page a.btn')
        .last()
        .ifNotReturn()
        .getAttribute('href')
        .regex('[a-z]?(\\d+)', 1)
        .setVariable('malID')
        .string('https://myanimelist.net/anime/_ID_')
        .replace('_ID_', $c.getVariable('malID').run());

      return malID.run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .trigger()
        .detectChanges($c.url().urlStrip().run(), $c.trigger().run())
        .run();
    },
    syncIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .and(
              $c.url().urlParam('episode').boolean().run(),
              $c.querySelector('.page h1').boolean().run(),
              $c.querySelector('[data-scroll-id]').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .detectChanges($c.url().run(), $c.trigger().run())
        .run();
    },
    overviewIsReady($c) {
      return $c
        .waitUntilTrue(
          $c
            .or(
              $c.querySelector('.page h2').boolean().run(),
              $c.querySelector('.page h1').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .run();
    },
  },
};

function getCurrentEpisodeBtn($c: ChibiGenerator<unknown>) {
  return $c.querySelector(
    $c
      .string('[data-scroll-id="_EP_ID_"]')
      .replace('_EP_ID_', $c.url().urlParam('episode').string().run())
      .run(),
  );
}
