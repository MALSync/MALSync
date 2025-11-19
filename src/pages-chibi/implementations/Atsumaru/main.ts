import { PageInterface } from '../../pageInterface';

export const Atsumaru: PageInterface = {
  name: 'Atsumaru',
  domain: 'https://atsu.moe/',
  languages: ['English'],
  type: 'manga',
  urls: {
    match: ['*://atsu.moe/*'],
  },
  search: 'https://atsu.moe/search?query={searchtermRaw}',
  sync: {
    isSyncPage($c) {
      return $c
        .and($c.url().urlPart(3).equals('read').run(), $c.url().urlPart(5).boolean().run())
        .run();
    },
    getTitle($c) {
      return $c.querySelector('.box-content a[href^="/manga/"]').text().trim().run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .querySelector('.box-content a[href^="/manga/"]')
        .getAttribute('href')
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c.title().regex('(\\d+)', 1).number().run();
    },
    readerConfig: [
      {
        condition: $c => $c.querySelector('.wrapper img').boolean().run(),
        current: $c => $c.querySelectorAll('.wrapper img').countAbove().run(),
        total: $c => $c.querySelectorAll('.wrapper img').length().run(),
      },
      {
        condition: $c => $c.querySelector('.z-1').boolean().run(),
        // I use arrayFind in case it read chapter number instead
        current: $c =>
          $c
            .querySelectorAll('.size-full option:checked')
            .arrayFind($item => $item.text().includes('Page').run())
            .text()
            .regex('Page (\\d+)', 1)
            .number()
            .run(),
        total: $c => $c.querySelectorAll('.z-1 img').length().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(3).equals('manga').run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c.title().run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c
        .querySelector('[property="og:image"]')
        .getAttribute('content')
        .urlAbsolute()
        .ifNotReturn()
        .run();
    },
    getMalUrl($c) {
      const getMal = $c
        .querySelector('.aspect-square[title="MyAnimeList"]')
        .ifNotReturn()
        .getAttribute('href')
        .run();

      const getAnilist = $c
        .provider()
        .equals('ANILIST')
        .ifNotReturn()
        .querySelector('.aspect-square[title="AniList"]')
        .getAttribute('href')
        .run();

      return $c.coalesce($c.fn(getAnilist).run(), $c.fn(getMal).run()).ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.md\\:block').uiAfter().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.flex-col > .relative.flex > a').run();
    },
    elementUrl($c) {
      return $c.getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('span').text().regex('(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.flex-col.gap-6').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};
