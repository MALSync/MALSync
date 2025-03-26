/* eslint-disable @typescript-eslint/no-use-before-define */
import type { PageInterface } from '../../pageInterface';

export const ranobeLib: PageInterface = {
  name: 'RanobeLib',
  type: 'manga',
  domain: 'https://ranobelib.me',
  languages: ['Russian'],
  urls: {
    match: ['*://ranobelib.me/*'],
  },
  search: 'https://ranobelib.me/ru/catalog?q={searchterm}',
  minimumVersion: '0.11.1',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(5).equals('read').run();
    },
    getTitle($c) {
      const nameAlt = $c.querySelector('a>div[data-media-up="sm"]');
      const nameRu = nameAlt.ifThen($d => $d.next().run());
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
        .log('TEST-title')
        .run();
    },
    getIdentifier($c) {
      const slug = $c.url().urlPart(4);
      const id = slug.string().regex('(\\d+)', 1);
      return id.run();
    },
    getOverviewUrl($c) {
      const slug = $c.url().urlPart(4);
      return $c.string('ru/book/_URL_SLUG_').replace('_URL_SLUG_', slug.run()).urlAbsolute().run();
    },
    getEpisode($c) {
      const episode = $c.url().urlPart(7).substring(1).split('.').at(0).number();
      return episode.run();
    },
    getVolume($c) {
      const volume = $c.url().urlPart(6).substring(1).number();
      return volume.run();
    },
    nextEpUrl($c) {
      const btnNext = $c.querySelectorAll('header a[href]').last();
      const next = $c
        .if(
          $c
            .and(
              btnNext.boolean().run(),
              btnNext.getAttribute('href').boolean().run(),
              btnNext.getComputedStyle('pointer-events').equals('none').not().run(),
            )
            .run(),
          btnNext.getAttribute('href').urlAbsolute().run(),
          $c.string('').run(),
        )
        .log('TEST-next');
      return next.run();
    },
    // readerConfig($c) {
    //   // TODO - when it's implemented
    // },
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(4).equals('book').run();
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
        .log('TEST-title')
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
  },
  lifecycle: {
    setup($c) {
      return (
        $c
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, global-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
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
            .or(
              $c.querySelector('.text-content p').boolean().run(),
              $c.querySelector('[data-paragraph-index]').boolean().run(),
            )
            .run(),
        )
        .trigger()
        .detectChanges($c.url().urlStrip().run(), $c.trigger().run())
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
