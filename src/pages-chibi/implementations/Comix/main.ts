import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import type { PageInterface } from '../../pageInterface';

export const Comix: PageInterface = {
  name: 'Comix',
  type: 'manga',
  domain: 'https://comix.to',
  languages: ['English'],
  urls: {
    match: ['*://comix.to/*'],
  },
  search: 'https://comix.to/browse?q={searchtermPlus}&sort=relevance%3Adesc',
  sync: {
    isSyncPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('title').run(),
          $c.url().urlPart(5).matches('chapter-').run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          getSyncData($c).get('name').ifNotReturn().run(),
          $c.title().replaceRegex('\\s*·\\s*Ch\\..*$', '').trim().run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).regex('^([^-]+)', 1).run();
    },
    getOverviewUrl($c) {
      return $c.url().split('/').slice(0, 5).join('/').run();
    },
    getEpisode($c) {
      return $c
        .coalesce(
          $c.url().urlPart(5).regex('chapter-(\\d+)', 1).number().ifNotReturn().run(),
          getSyncData($c).get('number').number().run(),
        )
        .run();
    },
    getImage($c) {
      return $c
        .coalesce(
          $c.querySelector('main img[alt]').getAttribute('src').ifNotReturn().run(),
          $c.querySelector('meta[property="og:image"]').getAttribute('content').ifNotReturn().run(),
          $c.querySelector('[itemprop="image"]').getAttribute('src').ifNotReturn().run(),
        )
        .run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malId: $c
            .coalesce(
              getSyncData($c).get('mal_id').number().ifNotReturn().run(),
              $c
                .querySelector('a[href*="myanimelist.net/manga/"]')
                .getAttribute('href')
                .regex('/manga/(\\d+)', 1)
                .number()
                .ifNotReturn()
                .run(),
            )
            .run(),
          anilistId: $c
            .coalesce(
              getSyncData($c).get('anilist_id').number().ifNotReturn().run(),
              $c
                .querySelector('a[href*="anilist.co/manga/"]')
                .getAttribute('href')
                .regex('/manga/(\\d+)', 1)
                .number()
                .ifNotReturn()
                .run(),
            )
            .run(),
        })
        .run();
    },
    readerConfig: [
      {
        current: {
          selector: '.rpage-progress__seg.is-visited, .rpage-progress__seg.is-active',
          mode: 'count',
        },
        total: {
          selector: '.rpage-progress__seg',
          mode: 'count',
        },
      },
    ],
    nextEpUrl($c) {
      return $c
        .coalesce(
          getSyncData($c)
            .get('next_chapter_url')
            .string()
            .replaceRegex('^(https?:\\/\\/comix\\.to)+', 'https://comix.to')
            .ifNotReturn()
            .run(),
          getSyncData($c).get('next_url').ifNotReturn().string().urlAbsolute().run(),
          $c
            .querySelector('link[rel="next"]')
            .getAttribute('href')
            .ifNotReturn()
            .urlAbsolute()
            .run(),
        )
        .run();
    },
  },
  overview: {
    isOverviewPage($c) {
      return $c
        .and(
          $c.url().urlPart(3).equals('title').run(),
          $c.url().urlPart(4).boolean().run(),
          $c.url().urlPart(5).boolean().not().run(),
        )
        .run();
    },
    getTitle($c) {
      return $c
        .coalesce(
          $c.querySelector('h1').text().trim().ifNotReturn().run(),
          $c.title().replaceRegex('\\s*·\\s*Ch\\..*$', '').trim().run(),
        )
        .run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.this('sync.getImage').run();
    },
    uiInjection($c) {
      return $c.querySelector('.mpage__desc, .description, .mpage__main').uiBefore().run();
    },
    getMalUrl($c) {
      return $c.this('sync.getMalUrl').run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.mchap-list > li.mchap-item').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.this('list.elementUrl').this('sync.getEpisode').run();
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
      return $c
        .waitUntilTrue(
          $c
            .or(
              $c.querySelector('#syncData').boolean().run(),
              $c.querySelector('.rpage-progress__seg').boolean().run(),
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
            .querySelector('.mchap-list > li.mchap-item, .chap-list > li:not(.head)')
            .boolean()
            .run(),
        )
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.mchap-list > li.mchap-item').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

function getSyncData($c: ChibiGenerator<unknown>) {
  return $c.querySelector('#syncData').ifNotReturn().text().jsonParse();
}
