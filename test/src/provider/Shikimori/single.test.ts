import { Single } from '../../../../src/_provider/Shikimori/single';
import { generalSingleTests } from '../generalSingleTests.exclude';
import { setConAndUtils, createProviderApi, createFixtureXhr } from '../../utils/singleNetworkStub';

const fixtures = [
  {
    url: /\/api\/users\/whoami/,
    response: { id: 1, nickname: 'tester', locale: 'en' },
  },
  {
    url: /\/api\/animes\/21$/,
    response: {
      id: 21,
      name: 'One Piece',
      russian: 'One Piece',
      image: { preview: '/uploads/poster/animes/21/preview.jpg' },
      url: '/animes/21-one-piece',
      kind: 'tv',
      score: '8.5',
      episodes: 0,
      volumes: 0,
      chapters: 0,
    },
  },
  {
    url: /\/api\/v2\/user_rates\?.*target_id=21/,
    response: [
      {
        id: 1,
        user_id: 1,
        target_id: 21,
        target_type: 'Anime',
        score: 0,
        status: 'watching',
        rewatches: 0,
        episodes: 0,
        volumes: 0,
        chapters: 0,
        text: '',
      },
    ],
  },
  {
    url: /\/api\/animes\/20$/,
    response: {
      id: 20,
      name: 'Naruto',
      russian: 'Naruto',
      image: { preview: '/uploads/poster/animes/20/preview.jpg' },
      url: '/animes/20-naruto',
      kind: 'tv',
      score: '7.9',
      episodes: 220,
      volumes: 0,
      chapters: 0,
    },
  },
  {
    // Not on list.
    url: /\/api\/v2\/user_rates\?.*target_id=20/,
    response: [],
  },
  {
    url: /\/api\/animes\/999999999$/,
    response: {},
  },
  {
    url: /\/api\/animes\/1535$/,
    response: {
      id: 1535,
      name: 'Death Note',
      russian: 'Death Note',
      image: { preview: '/uploads/poster/animes/1535/preview.jpg' },
      url: '/animes/1535-death-note',
      kind: 'tv',
      score: '8.6',
      episodes: 37,
      volumes: 0,
      chapters: 0,
    },
  },
  {
    url: /\/api\/v2\/user_rates\?.*target_id=1535/,
    response: [
      {
        id: 2,
        user_id: 1,
        target_id: 1535,
        target_type: 'Anime',
        score: 0,
        status: 'watching',
        rewatches: 0,
        episodes: 0,
        volumes: 0,
        chapters: 0,
        text: '',
      },
    ],
  },
];

setGlobals();
function setGlobals() {
  setConAndUtils();
  global.api = createProviderApi({ tokenKey: 'shikiToken', xhr: createFixtureXhr(fixtures) });
  global.api.token = { access_token: 'valid-token', refresh_token: 'valid-refresh' };

  global.testData = {
    urlTest: [
      { url: 'https://shikimori.io/animes/21-one-piece', error: false, type: 'anime' },
      { url: 'https://shikimori.io/mangas/2-berserk', error: false, type: 'manga' },
      { url: 'https://myanimelist.net/anime/21/One_Piece', error: false, type: 'anime' },
      { url: 'https://anilist.co/anime/21/One-Piece', error: true, type: 'anime' },
      { url: 'https://kitsu.app/anime/one-piece', error: true, type: 'anime' },
      { url: 'https://simkl.com/anime/38636/one-piece', error: true, type: 'anime' },
      { url: 'https://mangabaka.org/21', error: true, type: 'anime' },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://shikimori.io/animes/21-one-piece',
        displayUrl: 'https://shikimori.io/animes/21-one-piece',
        malUrl: 'https://myanimelist.net/anime/21',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image: 'https://shikimori.io/uploads/poster/animes/21/preview.jpg',
        rating: '8.5',
        cacheKey: 21,
      },
      notOnListUrl: {
        url: 'https://shikimori.io/animes/20-naruto',
        displayUrl: 'https://shikimori.io/animes/20-naruto',
        malUrl: 'https://myanimelist.net/anime/20',
        title: 'Naruto',
        eps: 220,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://shikimori.io/animes/999999999-nonexistent',
      },
      hasTotalEp: {
        url: 'https://shikimori.io/animes/1535-death-note',
      },
    },
  };
}

describe('Shikimori Single', function() {
  before(function() {
    setGlobals();
  });

  generalSingleTests(Single, setGlobals);
});
