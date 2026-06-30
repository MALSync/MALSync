import type { ChibiGenerator } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';

// KamiYomu URL patterns:
//   Reader:   /Reader/MangaReader/{libraryId}/chapter/{chapterDownloadId}?page=N
//   Overview: /Libraries/MangaInfo/{libraryId}
//
// We intercept two internal API calls KamiYomu makes while loading:
//   GET /Public/api/v1/Collection/{libraryId}
//     → { manga: { title, links: { AniList, MyAnimeList, Kitsu } } }
//   GET /Public/api/v1/Collection/{libraryId}/chapters/{chapterDownloadId}
//     → { number, volume }

export const KamiYomu: PageInterface = {
  name: 'KamiYomu',
  domain: ['http://localhost', 'http://localhost:8090'],
  languages: ['Many'],
  type: 'manga',
  minimumVersion: '0.12.3',
  urls: {
    match: [
      '*://*/Reader/MangaReader/*',
      '*://*/Libraries/MangaInfo/*',
    ],
  },
  features: {
    requestProxy: true,
    customDomains: true,
  },
  search: '{domain}/Libraries/Downloads?Handler=Search&Query={searchtermPlus}',
  sync: {
    isSyncPage($c) {
      return $c.url().urlPart(3).equals('MangaReader').run();
    },
    getTitle($c) {
      return $c
        .getGlobalVariable('kamiyomu_title')
        .ifNotReturn($c.querySelector('title').text().trim().run())
        .run();
    },
    getIdentifier($c) {
      // libraryId is part 4 of the reader URL
      return $c.url().urlPart(4).run();
    },
    getOverviewUrl($c) {
      return $c
        .url()
        .urlPart(4)
        .setVariable('libraryId')
        .string('/Libraries/MangaInfo/')
        .concat($c.getVariable('libraryId').run())
        .urlAbsolute()
        .run();
    },
    getEpisode($c) {
      return $c
        .getGlobalVariable('kamiyomu_chapter')
        .ifNotReturn($c.number(1).run())
        .number()
        .run();
    },
    getVolume($c) {
      return $c
        .getGlobalVariable('kamiyomu_volume')
        .ifNotReturn($c.number(0).run())
        .number()
        .run();
    },
    getMalUrl($c) {
      return $c.getGlobalVariable('kamiyomu_mal_url').ifNotReturn().run();
    },
    readerConfig: [
      {
        current: {
          // KamiYomu appends ?page=N to the reader URL as you turn pages
          mode: 'url',
          regex: '(\\?|&)page=(\\d+)',
          group: 2,
        },
        total: {
          callback: () =>
            (window as any).__kamiyomu_totalPages || 0,
          mode: 'callback',
        },
      },
    ],
  },
  overview: {
    isOverviewPage($c) {
      return $c.url().urlPart(3).equals('MangaInfo').run();
    },
    getTitle($c) {
      return $c
        .getGlobalVariable('kamiyomu_title')
        .ifNotReturn($c.querySelector('h1, h2, h3').text().trim().run())
        .run();
    },
    getIdentifier($c) {
      return $c.url().urlPart(4).run();
    },
    getImage($c) {
      return $c
        .querySelector('img[src*="/Collection/"]')
        .getAttribute('src')
        .ifNotReturn()
        .urlAbsolute()
        .run();
    },
    uiInjection($c) {
      return $c.querySelector('h1, h2, h3').uiAfter().run();
    },
    getMalUrl($c) {
      return $c.getGlobalVariable('kamiyomu_mal_url').ifNotReturn().run();
    },
  },
  list: {
    elementsSelector($c) {
      return $c.querySelectorAll('table tbody tr').run();
    },
    elementUrl($c) {
      return $c.target().find('a').getAttribute('href').urlAbsolute().run();
    },
    elementEp($c) {
      return $c
        .target()
        .find('td')
        .first()
        .text()
        .trim()
        .regex('(\\d+\\.?\\d*)$', 1)
        .ifNotReturn()
        .number()
        .run();
    },
  },
  lifecycle: {
    setup($c) {
      return $c.addStyle(require('./style.less?raw').toString()).run();
    },
    ready($c) {
      return $c
        .requestProxy($c =>
          handleRequest(
            $c.setVariable('request').get('url').setVariable('requestUrl'),
          ).run(),
        )
        .run();
    },
    listChange($c) {
      return $c
        .detectChanges(
          $c.querySelectorAll('table tbody tr').length().run(),
          $c.trigger().run(),
        )
        .run();
    },
  },
};

// Intercept KamiYomu's own API responses to extract manga/chapter metadata
function handleRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable<string>('requestUrl')
    // Collection endpoint: /Public/api/v1/Collection/{libraryId}
    // but NOT the chapters sub-endpoint
    .matches('/Public/api/v1/Collection/[^/]+(\\?|$)')
    .ifThen($c => handleCollectionRequest($c).return().run())
    .getVariable<string>('requestUrl')
    // Chapter endpoint: /Public/api/v1/Collection/{libraryId}/chapters/{chapterDownloadId}
    .matches('/Public/api/v1/Collection/[^/]+/chapters/')
    .ifThen($c => handleChapterRequest($c).return().run());
}

function handleCollectionRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('request')
    .get('data')
    .setVariable('collectionData')
    // title
    .get('manga')
    .get('title')
    .setGlobalVariable('kamiyomu_title')
    // tracker links
    .getVariable('collectionData')
    .get('manga')
    .get('links')
    .setVariable('links')
    // MAL
    .getVariable<string>('links')
    .get('MyAnimeList')
    .ifThen($c =>
      $c
        .getVariable<string>('links')
        .get('MyAnimeList')
        .setGlobalVariable('kamiyomu_mal_url')
        .return()
        .run(),
    )
    // AniList
    .getVariable<string>('links')
    .get('AniList')
    .setGlobalVariable('kamiyomu_mal_url')
    .trigger();
}

function handleChapterRequest($c: ChibiGenerator<unknown>) {
  return $c
    .getVariable('request')
    .get('data')
    .setVariable('chapterData')
    .get('number')
    .setGlobalVariable('kamiyomu_chapter')
    .getVariable('chapterData')
    .get('volume')
    .setGlobalVariable('kamiyomu_volume')
    .trigger();
}
