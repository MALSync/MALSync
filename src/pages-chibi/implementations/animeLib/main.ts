/* eslint-disable @typescript-eslint/no-use-before-define */
import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import type { PageInterface } from '../../pageInterface';

export const animeLib: PageInterface = {
  name: 'AnimeLib',
  type: 'anime',
  domain: 'https://anilib.me',
  languages: ['Russian'],
  urls: {
    match: ['*://anilib.me/*'],
  },
  search: 'https://anilib.me/ru/catalog?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(6).boolean().run(), $c.url().urlPart(4).equals('anime').run())
        .run();
    },
    getTitle($c) {
      return $c
        .fn(
          $c
            .querySelector('.page h1')
            .ifThen($d => $d.text().return().run())
            .string('')
            .run(),
        )
        .run();
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
      return $c
        .fn(
          btnEp
            .ifThen($d => $d.text().split(' ').at(0).number().return().run())
            .number(0)
            .run(),
        )
        .run();
    },
    nextEpUrl($c) {
      const btnEp = getCurrentEpisodeBtn($c);
      const slug = $c.url().urlPart(5);
      const next = $c.fn(
        $c
          .and(btnEp.boolean().run(), btnEp.next().boolean().run())
          .ifThen($d =>
            $d
              .string('ru/anime/_URL_SLUG_/watch?episode=_EP_ID_')
              .replace('_EP_ID_', btnEp.next().getAttribute('data-scroll-id').string().run())
              .replace('_URL_SLUG_', slug.run())
              .urlAbsolute()
              .return()
              .run(),
          )
          .string('')
          .run(),
      );
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
      return $c
        .fn(
          nameAlt
            .ifThen($d => $d.text().return().run())
            .fn(
              nameRu
                .ifThen($d => $d.text().return().run())
                .string('')
                .run(),
            )
            .run(),
        )
        .run();
    },
    getIdentifier($c) {
      const slug = $c.url().urlPart(5);
      const id = slug.string().regex('(\\d+)', 1);
      return id.run();
    },
    uiInjection($c) {
      return $c.querySelector('.tabs._border').uiBefore().run();
    },
    getMalUrl($c) {
      const malID = $c.fn(
        $c
          .querySelectorAll('.page a.btn')
          .last()
          .ifThen($d => $d.getAttribute('href').regex('[a-z]?(\\d+)', 1).return().run())
          .string('')
          .run(),
      );
      return malID
        .boolean()
        .ifThen($d =>
          $d
            .string('https://myanimelist.net/anime/_ID_')
            .replace('_ID_', malID.run())
            .return()
            .run(),
        )
        .string('')
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return (
        $c
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          .addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString())
          .run()
      );
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
