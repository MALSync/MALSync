import { Single } from '../../../../src/_provider/Simkl/single';
import { generalSingleTests } from '../generalSingleTests.exclude';
import { setConAndUtils, createProviderApi, createFixtureXhr } from '../../utils/singleNetworkStub';

const fixtures = [
  {
    url: /\/sync\/activities$/,
    response: { anime: { all: 1, rated_at: 1, removed_from_list: 1 } },
  },
  {
    url: /\/sync\/all-items\/anime/,
    response: {
      anime: [
        {
          status: 'watching',
          user_rating: null,
          last_watched: 'S01E00',
          next_to_watch: 'S01E01',
          not_aired_episodes_count: 0,
          private_memo: '',
          total_episodes_count: 0,
          watched_episodes_count: 0,
          show: { title: 'One Piece', poster: 'poster138', ids: { simkl: 138, mal: 21 } },
        },
        {
          status: 'watching',
          user_rating: null,
          last_watched: 'S01E00',
          next_to_watch: 'S01E01',
          not_aired_episodes_count: 0,
          private_memo: '',
          total_episodes_count: 37,
          watched_episodes_count: 0,
          show: { title: 'Death Note', poster: 'poster1535', ids: { simkl: 1535, mal: 1535 } },
        },
      ],
    },
  },
  {
    url: /\/ratings\?.*simkl=138/,
    response: { simkl: { rating: 8.1 } },
  },
  {
    url: /\/search\/id\?.*mal=20$/,
    response: [{ title: 'Naruto', poster: 'poster20', ids: { simkl: 999, mal: 20 } }],
  },
  {
    // Anything else looked up by mal id (e.g. the nonExistingMAL scenario) is unknown.
    url: /\/search\/id\?.*mal=\d+$/,
    response: [],
  },
];

setGlobals();
function setGlobals() {
  setConAndUtils();
  global.api = createProviderApi({
    tokenKey: 'simklToken',
    xhr: createFixtureXhr(fixtures),
    unauthorizedResponse: { status: 401, response: { error: 'user_token_failed' } },
  });

  global.testData = {
    urlTest: [
      { url: 'https://simkl.com/anime/138/one-piece', error: false, type: 'anime' },
      { url: 'https://simkl.com/manga/2/berserk', error: true, type: 'manga' },
      { url: 'https://myanimelist.net/anime/21/One_Piece', error: false, type: 'anime' },
      { url: 'https://anilist.co/anime/21/One-Piece', error: true, type: 'anime' },
      { url: 'https://kitsu.app/anime/one-piece', error: true, type: 'anime' },
      { url: 'https://shikimori.one/animes/21-one-piece', error: true, type: 'anime' },
      { url: 'https://mangabaka.org/21', error: true, type: 'anime' },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://simkl.com/anime/138/one-piece',
        displayUrl: 'https://simkl.com/anime/138',
        malUrl: 'https://myanimelist.net/anime/21',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image: 'https://simkl.in/posters/poster138_ca.jpg',
        rating: 8.1,
        cacheKey: 21,
      },
      notOnListUrl: {
        url: 'https://myanimelist.net/anime/20/Naruto',
        displayUrl: 'https://simkl.com/anime/999',
        malUrl: 'https://myanimelist.net/anime/20',
        title: 'Naruto',
        eps: 0,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://myanimelist.net/anime/999999999/Nonexistent',
      },
      hasTotalEp: {
        url: 'https://simkl.com/anime/1535/death-note',
      },
    },
  };
}

describe('Simkl Single', function() {
  before(function() {
    setGlobals();
  });

  generalSingleTests(Single, setGlobals);
});
