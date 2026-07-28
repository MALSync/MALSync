import { Single } from '../../../../src/_provider/AniList/single';
import { generalSingleTests } from '../generalSingleTests.exclude';
import { setConAndUtils, createProviderApi, createFixtureXhr } from '../../utils/singleNetworkStub';

const fixtures = [
  {
    method: 'POST',
    url: 'https://graphql.anilist.co',
    body: /"id":21,/,
    response: {
      data: {
        Media: {
          id: 21,
          idMal: 21,
          title: { userPreferred: 'One Piece' },
          siteUrl: 'https://anilist.co/anime/21/One-Piece',
          episodes: null,
          chapters: null,
          volumes: null,
          averageScore: 87,
          coverImage: { large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/b21.jpg' },
          mediaListEntry: {
            id: 1,
            status: 'CURRENT',
            startedAt: { year: null, month: null, day: null },
            completedAt: { year: null, month: null, day: null },
            progress: 0,
            progressVolumes: 0,
            score: 0,
            repeat: 0,
            notes: '',
          },
        },
      },
    },
  },
  {
    method: 'POST',
    url: 'https://graphql.anilist.co',
    body: /"id":20,/,
    response: {
      data: {
        Media: {
          id: 20,
          idMal: 20,
          title: { userPreferred: 'Naruto' },
          siteUrl: 'https://anilist.co/anime/20/Naruto',
          episodes: 220,
          chapters: null,
          volumes: null,
          averageScore: 79,
          coverImage: { large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/b20.jpg' },
          mediaListEntry: null,
        },
      },
    },
  },
  {
    method: 'POST',
    url: 'https://graphql.anilist.co',
    body: /"id":999999999,/,
    response: { errors: [{ status: 404, message: 'Not Found.' }] },
  },
  {
    method: 'POST',
    url: 'https://graphql.anilist.co',
    body: /"id":1535,/,
    response: {
      data: {
        Media: {
          id: 1535,
          idMal: 1535,
          title: { userPreferred: 'Death Note' },
          siteUrl: 'https://anilist.co/anime/1535/Death-Note',
          episodes: 37,
          chapters: null,
          volumes: null,
          averageScore: 84,
          coverImage: { large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/b1535.jpg' },
          mediaListEntry: {
            id: 2,
            status: 'CURRENT',
            startedAt: { year: null, month: null, day: null },
            completedAt: { year: null, month: null, day: null },
            progress: 0,
            progressVolumes: 0,
            score: 0,
            repeat: 0,
            notes: '',
          },
        },
      },
    },
  },
];

setGlobals();
function setGlobals() {
  setConAndUtils();
  global.api = createProviderApi({ tokenKey: 'anilistToken', xhr: createFixtureXhr(fixtures) });

  global.testData = {
    urlTest: [
      { url: 'https://anilist.co/anime/21/One-Piece', error: false, type: 'anime' },
      { url: 'https://anilist.co/manga/2/Berserk', error: false, type: 'manga' },
      // AniList's handleUrl also accepts bare MAL urls as a cross-link.
      { url: 'https://myanimelist.net/anime/21/One_Piece', error: false, type: 'anime' },
      { url: 'https://kitsu.app/anime/one-piece', error: true, type: 'anime' },
      { url: 'https://simkl.com/anime/38636/one-piece', error: true, type: 'anime' },
      { url: 'https://shikimori.one/animes/21-one-piece', error: true, type: 'anime' },
      { url: 'https://mangabaka.org/21', error: true, type: 'anime' },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://anilist.co/anime/21/One-Piece',
        displayUrl: 'https://anilist.co/anime/21/One-Piece',
        malUrl: 'https://myanimelist.net/anime/21',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/b21.jpg',
        rating: 87,
        cacheKey: 21,
      },
      notOnListUrl: {
        url: 'https://anilist.co/anime/20/Naruto',
        displayUrl: 'https://anilist.co/anime/20/Naruto',
        malUrl: 'https://myanimelist.net/anime/20',
        title: 'Naruto',
        eps: 220,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://anilist.co/anime/999999999/Nonexistent',
      },
      hasTotalEp: {
        url: 'https://anilist.co/anime/1535/Death-Note',
      },
    },
  };
}

describe('AniList Single', function() {
  before(function() {
    setGlobals();
  });

  generalSingleTests(Single, setGlobals);
});
