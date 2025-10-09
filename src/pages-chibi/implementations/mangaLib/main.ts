/* eslint-disable @typescript-eslint/no-use-before-define */
import type { PageInterface } from '../../pageInterface';

export const mangaLib: PageInterface = {
  name: 'MangaLib',
  type: 'manga',
  domain: [
    'https://mangalib.me',
    'https://mangalib.org',
    'https://slashlib.me',
    'https://v2.slashlib.me',
    'https://v1.yaoilib.net',
  ],
  languages: ['Russian'],
  urls: {
    match: [
      '*://mangalib.org/*',
      '*://mangalib.me/*',
      '*://*.slashlib.me/*',
      '*://*.yaoilib.net/*',
    ],
  },
  search: 'https://mangalib.me/ru/catalog?q={searchterm}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(5).equals('read').run();
    },
    getTitle($c) {
      const nameAlt = $c.querySelector('a>div[data-media-up="sm"]');
      const nameRu = nameAlt.ifThen($d => $d.next().run());
      return $c.coalesce(nameRu.run(), nameAlt.run()).ifNotReturn().text().trim().run();
    },
    getIdentifier($c) {
      const slug = $c.url().urlPart(4);
      const id = slug.string().regex('(\\d+)', 1);
      return id.run();
    },
    getOverviewUrl($c) {
      const slug = $c.url().urlPart(4);
      return $c.string('ru/manga/_URL_SLUG_').replace('_URL_SLUG_', slug.run()).urlAbsolute().run();
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
      const next = $c.if(
        $c
          .and(
            btnNext.boolean().run(),
            btnNext.getAttribute('href').boolean().run(),
            btnNext.getComputedStyle('pointer-events').equals('none').not().run(),
          )
          .run(),
        btnNext.getAttribute('href').urlAbsolute().urlStrip().run(),
        $c.string('').run(),
      );
      return next.run();
    },
    readerConfig: [
      {
        current: {
          selector: 'footer',
          mode: 'text',
          regex: '(\\d+) / (\\d+)$',
          group: 1,
        },
        total: {
          selector: 'footer',
          mode: 'text',
          regex: '(\\d+) / (\\d+)$',
          group: 2,
        },
      },
      // TODO - Replace when PR#3296 is merged
      // {
      //   current: $c => $c.querySelector('footer').text().regex('(\\d+) / (\\d+)$', 1).run(),
      //   total: $c => $c.querySelector('footer').text().regex('(\\d+) / (\\d+)$', 2).run(),
      // },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(4).equals('manga').run();
    },
    getTitle($c) {
      const nameRu = $c.querySelector('.page h1');
      const nameAlt = $c.querySelector('.page h2');
      return $c.coalesce(nameRu.run(), nameAlt.run()).ifNotReturn().text().trim().run();
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
              $c.querySelector('main img').boolean().run(),
              $c.querySelector('a>div[data-media-up="sm"]').boolean().run(),
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
