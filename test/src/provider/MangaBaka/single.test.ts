import { Single } from '../../../../src/_provider/MangaBaka/single';
import { generalSingleTests } from '../generalSingleTests.exclude';
import { setConAndUtils, createProviderApi, createFixtureXhr } from '../../utils/singleNetworkStub';

const libraryEntry = {
  id: 501,
  user_id: 'u1',
  state: 'reading',
  rating: 0,
  progress_chapter: 0,
  progress_volume: 0,
  start_date: null,
  finish_date: null,
  number_of_rereads: 0,
  note: '',
};

const fixtures = [
  {
    url: /\/v1\/series\/21$/,
    response: {
      status: 200,
      data: {
        id: 21,
        title: 'Berserk',
        source: { my_anime_list: { id: 2 }, anilist: { id: null }, kitsu: { id: null } },
        cover: { x350: { x2: 'https://mangabaka.org/img/21.jpg' } },
        rating: 9.47,
        status: 'releasing',
        total_chapters: '0',
        final_volume: null,
      },
    },
  },
  {
    url: /\/v1\/my\/library\/21$/,
    response: { status: 200, data: { ...libraryEntry, id: 501, series_id: 21 } },
  },
  {
    url: /\/v1\/series\/22$/,
    response: {
      status: 200,
      data: {
        id: 22,
        title: 'Naruto',
        source: { my_anime_list: { id: 20 }, anilist: { id: null }, kitsu: { id: null } },
        cover: { x350: { x2: 'https://mangabaka.org/img/22.jpg' } },
        rating: 7.9,
        status: 'releasing',
        total_chapters: '0',
        final_volume: null,
      },
    },
  },
  {
    // Not on list.
    url: /\/v1\/my\/library\/22$/,
    status: 404,
    response: { status: 404, message: 'Not Found' },
  },
  {
    url: /\/v1\/source\/my-anime-list\/999999999$/,
    response: { status: 200, data: { series: [] } },
  },
  {
    url: /\/v1\/series\/23$/,
    response: {
      status: 200,
      data: {
        id: 23,
        title: 'Death Note',
        source: { my_anime_list: { id: 1535 }, anilist: { id: null }, kitsu: { id: null } },
        cover: { x350: { x2: 'https://mangabaka.org/img/23.jpg' } },
        rating: 8.6,
        status: 'completed',
        total_chapters: '37',
        final_volume: '4',
      },
    },
  },
  {
    url: /\/v1\/my\/library\/23$/,
    response: { status: 200, data: { ...libraryEntry, id: 502, series_id: 23 } },
  },
];

setGlobals();
function setGlobals() {
  setConAndUtils();
  global.api = createProviderApi({
    tokenKey: 'mangabakaToken',
    xhr: createFixtureXhr(fixtures),
    unauthorizedResponse: { status: 401, response: { status: 401, message: 'Bad token' } },
  });

  global.testData = {
    urlTest: [
      { url: 'https://mangabaka.org/21', error: false, type: 'manga' },
      { url: 'https://myanimelist.net/manga/2/Berserk', error: false, type: 'manga' },
      { url: 'https://myanimelist.net/anime/2/Berserk', error: true, type: 'anime' },
      { url: 'https://anilist.co/manga/2/Berserk', error: false, type: 'manga' },
      { url: 'https://kitsu.app/manga/berserk', error: true, type: 'manga' },
      { url: 'https://simkl.com/anime/38636/one-piece', error: true, type: 'anime' },
      { url: 'https://shikimori.one/mangas/2-berserk', error: true, type: 'manga' },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://mangabaka.org/21',
        displayUrl: 'https://mangabaka.org/21',
        malUrl: 'https://myanimelist.net/manga/2',
        title: 'Berserk',
        eps: 0,
        vol: 0,
        image: 'https://mangabaka.org/img/21.jpg.avif',
        rating: '9',
        cacheKey: 2,
      },
      notOnListUrl: {
        url: 'https://mangabaka.org/22',
        displayUrl: 'https://mangabaka.org/22',
        malUrl: 'https://myanimelist.net/manga/20',
        title: 'Naruto',
        eps: 0,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://myanimelist.net/manga/999999999/Nonexistent',
      },
      hasTotalEp: {
        url: 'https://mangabaka.org/23',
      },
    },
  };
}

describe('MangaBaka Single', function() {
  before(function() {
    setGlobals();
  });

  generalSingleTests(Single, setGlobals);
});
