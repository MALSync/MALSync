import { Single } from '../../../../src/_provider/Kitsu/single';
import { generalSingleTests } from '../generalSingleTests.exclude';
import { setConAndUtils, createProviderApi, createFixtureXhr } from '../../utils/singleNetworkStub';

function animeResource(id: string, attrs: any) {
  return { id, attributes: attrs };
}

const oneWiece = animeResource('12', {
  slug: 'one-piece',
  titles: { en: 'One Piece', en_jp: 'One Piece' },
  canonicalTitle: 'One Piece',
  averageRating: '85.5',
  posterImage: { large: 'https://media.kitsu.app/anime/poster_images/12/large.jpg' },
  episodeCount: null,
});
const naruto = animeResource('88', {
  slug: 'naruto',
  titles: { en: 'Naruto', en_jp: 'Naruto' },
  canonicalTitle: 'Naruto',
  averageRating: '79.1',
  posterImage: { large: 'https://media.kitsu.app/anime/poster_images/88/large.jpg' },
  episodeCount: 220,
});
const deathNote = animeResource('13', {
  slug: 'death-note',
  titles: { en: 'Death Note', en_jp: 'Death Note' },
  canonicalTitle: 'Death Note',
  averageRating: '86.2',
  posterImage: { large: 'https://media.kitsu.app/anime/poster_images/13/large.jpg' },
  episodeCount: 37,
});

const libraryEntry = {
  id: '555',
  attributes: {
    notes: '',
    progress: 0,
    volumesOwned: 0,
    reconsuming: false,
    reconsumeCount: 0,
    ratingTwenty: null,
    status: 'current',
    startedAt: null,
    finishedAt: null,
  },
};

const fixtures = [
  {
    url: /\/api\/edge\/(anime|manga)\?filter\[slug\]=one-piece/,
    response: {
      data: [oneWiece],
      included: [{ type: 'mappings', attributes: { externalSite: 'myanimelist/anime', externalId: '21' } }],
    },
  },
  {
    url: /\/api\/edge\/(anime|manga)\?filter\[slug\]=naruto/,
    response: {
      data: [naruto],
      included: [{ type: 'mappings', attributes: { externalSite: 'myanimelist/anime', externalId: '20' } }],
    },
  },
  {
    url: /\/api\/edge\/(anime|manga)\?filter\[slug\]=death-note/,
    response: {
      data: [deathNote],
      included: [{ type: 'mappings', attributes: { externalSite: 'myanimelist/anime', externalId: '1535' } }],
    },
  },
  {
    // Non-existing MAL url: no mapping found for this MAL id.
    url: /\/api\/edge\/mappings\?filter\[externalSite\]=myanimelist\/anime&filter\[externalId\]=999999999/,
    response: { data: [] },
  },
  {
    url: /\/api\/edge\/users\?filter\[self\]=true/,
    response: { data: [{ id: '999' }] },
  },
  {
    url: /filter\[anime_id\]=12(&|$)/,
    response: { data: [libraryEntry], included: [oneWiece] },
  },
  {
    // Not on list.
    url: /filter\[anime_id\]=88(&|$)/,
    response: { data: [] },
  },
  {
    url: /filter\[anime_id\]=13(&|$)/,
    response: { data: [libraryEntry], included: [deathNote] },
  },
];

setGlobals();
function setGlobals() {
  setConAndUtils();
  global.api = createProviderApi({
    tokenKey: 'kitsuToken',
    xhr: createFixtureXhr(fixtures),
    unauthorizedResponse: { status: 401, response: { errors: [{ status: '401', detail: 'Not Authenticated' }] } },
  });

  global.testData = {
    urlTest: [
      { url: 'https://kitsu.app/anime/one-piece', error: false, type: 'anime' },
      { url: 'https://kitsu.app/manga/one-piece', error: false, type: 'manga' },
      { url: 'https://myanimelist.net/anime/21/One_Piece', error: false, type: 'anime' },
      { url: 'https://anilist.co/anime/21/One-Piece', error: true, type: 'anime' },
      { url: 'https://simkl.com/anime/38636/one-piece', error: true, type: 'anime' },
      { url: 'https://shikimori.one/animes/21-one-piece', error: true, type: 'anime' },
      { url: 'https://mangabaka.org/21', error: true, type: 'anime' },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://kitsu.app/anime/one-piece',
        displayUrl: 'https://kitsu.app/anime/one-piece',
        malUrl: 'https://myanimelist.net/anime/21',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image: 'https://media.kitsu.app/anime/poster_images/12/large.jpg',
        rating: '85.5%',
        cacheKey: 21,
      },
      notOnListUrl: {
        url: 'https://kitsu.app/anime/naruto',
        displayUrl: 'https://kitsu.app/anime/naruto',
        malUrl: 'https://myanimelist.net/anime/20',
        title: 'Naruto',
        eps: 220,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://myanimelist.net/anime/999999999/Nonexistent',
      },
      hasTotalEp: {
        url: 'https://kitsu.app/anime/death-note',
      },
    },
  };
}

describe('Kitsu Single', function() {
  before(function() {
    setGlobals();
  });

  generalSingleTests(Single, setGlobals);
});
