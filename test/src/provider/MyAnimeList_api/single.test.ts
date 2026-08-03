import { Single } from '../../../../src/_provider/MyAnimeList_api/single';
import { generalSingleTests } from '../generalSingleTests.exclude';
import { setConAndUtils, createProviderApi, createFixtureXhr } from '../../utils/singleNetworkStub';

const fixtures = [
  {
    url: /\/v2\/anime\/21(\?|$)/,
    response: {
      title: 'One Piece',
      main_picture: { medium: 'https://api-cdn.myanimelist.net/images/anime/21.jpg' },
      num_episodes: 0,
      mean: 8.63,
      my_list_status: {
        status: 'watching',
        score: 0,
        num_watched_episodes: 0,
        is_rewatching: false,
        num_times_rewatched: 0,
        tags: [],
        start_date: '',
        finish_date: '',
      },
    },
  },
  {
    // not on list: no my_list_status
    url: /\/v2\/anime\/20(\?|$)/,
    response: {
      title: 'Naruto',
      main_picture: { medium: 'https://api-cdn.myanimelist.net/images/anime/20.jpg' },
      num_episodes: 220,
      mean: 7.91,
    },
  },
  {
    url: /\/v2\/anime\/999999999(\?|$)/,
    status: 404,
    response: { error: 'not_found' },
  },
  {
    url: /\/v2\/anime\/1535(\?|$)/,
    response: {
      title: 'Death Note',
      main_picture: { medium: 'https://api-cdn.myanimelist.net/images/anime/1535.jpg' },
      num_episodes: 37,
      mean: 8.62,
      my_list_status: {
        status: 'watching',
        score: 0,
        num_watched_episodes: 0,
        is_rewatching: false,
        num_times_rewatched: 0,
        tags: [],
        start_date: '',
        finish_date: '',
      },
    },
  },
];

setGlobals();
function setGlobals() {
  setConAndUtils();
  global.api = createProviderApi({
    tokenKey: 'malToken',
    xhr: createFixtureXhr(fixtures),
    unauthorizedResponse: { status: 401, response: { error: 'invalid_token' } },
  });

  global.testData = {
    urlTest: [
      { url: 'https://myanimelist.net/anime/21/One_Piece', error: false, type: 'anime' },
      { url: 'https://myanimelist.net/manga/2/Berserk', error: false, type: 'manga' },
      { url: 'https://anilist.co/anime/21/One-Piece', error: true, type: 'anime' },
      { url: 'https://kitsu.app/anime/one-piece', error: true, type: 'anime' },
      { url: 'https://simkl.com/anime/38636/one-piece', error: true, type: 'anime' },
      { url: 'https://shikimori.one/animes/21-one-piece', error: true, type: 'anime' },
      { url: 'https://mangabaka.org/21', error: true, type: 'anime' },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://myanimelist.net/anime/21/One_Piece',
        displayUrl: 'https://myanimelist.net/anime/21/One_Piece',
        malUrl: 'https://myanimelist.net/anime/21',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image: 'https://api-cdn.myanimelist.net/images/anime/21.jpg',
        rating: 8.63,
        cacheKey: 21,
      },
      notOnListUrl: {
        url: 'https://myanimelist.net/anime/20/Naruto',
        displayUrl: 'https://myanimelist.net/anime/20/Naruto',
        malUrl: 'https://myanimelist.net/anime/20',
        title: 'Naruto',
        eps: 220,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://myanimelist.net/anime/999999999/Nonexistent',
      },
      hasTotalEp: {
        url: 'https://myanimelist.net/anime/1535/Death_Note',
      },
    },
  };
}

describe('MyAnimeList_api Single', function() {
  before(function() {
    setGlobals();
  });

  generalSingleTests(Single, setGlobals);
});
