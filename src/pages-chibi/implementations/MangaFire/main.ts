import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

type MangaFireSyncData = {
  page: 'chapter' | 'overview' | 'volume';
  number: string;
  name: string;
  manga_id: string;
  mal_id: string;
  anilist_id: string;
  manga_url: string;
  next_chapter_url?: string;
};

export const MangaFire: PageInterface = {
  name: 'MangaFire',
  domain: 'https://mangafire.to',
  database: 'MangaFire',
  languages: ['English', 'Japanese', 'French', 'Spanish', 'Portuguese'],
  type: 'manga',
  urls: {
    match: ['*://mangafire.to/*'],
  },
  search: 'https://mangafire.to/filter?keyword={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.exec(getJsonData).get('page').equals('chapter').run();
    },
    getTitle($c) {
      return $c.exec(getJsonData).get('name').run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).split('-').first().run();
    },
    getOverviewUrl($c) {
      return $c.exec(getJsonData).get('manga_url').ifNotReturn().string().urlAbsolute().run();
    },
    getEpisode($c) {
      return $c.exec(getJsonData).get('number').number().run();
    },
    nextEpUrl($c) {
      return $c.exec(getJsonData).get('next_chapter_url').ifNotReturn().run();
    },
    getMalUrl($c) {
      return $c
        .providerUrlUtility({
          malId: $c.exec(getJsonData).get('mal_id').number().ifNotReturn().run(),
          anilistId: $c.exec(getJsonData).get('anilist_id').number().ifNotReturn().run(),
        })
        .run();
    },
    readerConfig: [
      {
        current: $c =>
          $c.querySelector('.reader-progress').getAttribute('aria-valuenow').number().run(),
        total: $c =>
          $c.querySelector('.reader-progress').getAttribute('aria-valuemax').number().run(),
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.exec(getJsonData).get('page').equals('overview').run();
    },
    getTitle($c) {
      return $c.this('sync.getTitle').run();
    },
    getIdentifier($c) {
      return $c.this('sync.getIdentifier').run();
    },
    getImage($c) {
      return $c.querySelector('.title-detail__poster img').getAttribute('src').ifNotReturn().run();
    },
    uiInjection($c) {
      return $c.querySelector('.title-detail__title').uiAfter().run();
    },
    getMalUrl($c) {
      return $c.provider().this('sync.getMalUrl').run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('.title-detail__chapters .title-detail__row').run();
    },
    elementUrl($c) {
      return $c.find('a').getAttribute('href').ifNotReturn().urlAbsolute().run();
    },
    elementEp($c) {
      return $c.find('.title-detail__row-num').text().regex('(\\d+)', 1).number().run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .domReady()
        .detectChanges(
          $c.querySelector('#syncData').ifNotReturn().text().trim().run(),
          $c.trigger().run(),
        )
        .trigger()
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelector('.list-menu .dropdown').ifNotReturn().text().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

function getJsonData($c: ChibiGenerator<unknown>): ChibiGenerator<MangaFireSyncData> {
  return $c
    .querySelector('#syncData')
    .ifNotReturn()
    .text()
    .jsonParse() as ChibiGenerator<MangaFireSyncData>;
}
