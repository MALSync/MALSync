import { expect } from 'chai';
import { Single } from '../../../../src/_provider/AnimeOshi/single';
import { UserList } from '../../../../src/_provider/AnimeOshi/list';
import { generalSingleTests } from '../generalSingleTests.exclude';
import { setConAndUtils, createProviderApi, createFixtureXhr } from '../../utils/singleNetworkStub';

const naruto = {
  id: 222242443,
  slug: 'naruto',
  episode_id: null,
  url: 'https://www.animeoshi.com/anime/naruto?utm_source=malsync',
  image: 'https://media.animeoshi.com/anime/images/222242443.jpg',
  mal_id: 20,
  anilist_id: 20,
  episode_count: 220,
  season: 'Fall 2002',
  release_date: '2002-10-03',
  status: 'Completed',
  oshimeter: { score: 8.4, rater_count: 1523 },
};

const tayo = {
  id: 743814481,
  slug: 'tayo-the-little-bus-season-4',
  episode_id: null,
  url: 'https://www.animeoshi.com/anime/tayo-the-little-bus-season-4?utm_source=malsync',
  image: 'https://media.animeoshi.com/anime/images/743814481.jpg',
  mal_id: 38074,
  anilist_id: 188058,
  episode_count: 26,
  season: 'Summer 2016',
  release_date: '2016-08-31',
  status: 'Completed',
  oshimeter: null,
};

const narutoEntry = {
  anime_id: 222242443,
  title: 'Naruto',
  slug: 'naruto',
  image: 'https://media.animeoshi.com/anime/images/222242443.jpg',
  url: 'https://www.animeoshi.com/anime/naruto?utm_source=malsync',
  mal_id: 20,
  anilist_id: 20,
  status: 'Currently Watching',
  episode_count: 12,
  updated_at: '2024-01-01',
  cursor: 'Naruto',
};

const fixtures = [
  { url: /\/anime\/external\/222242443$/, response: naruto },
  { url: /\/anime\/external\/743814481$/, response: tayo },
  { url: /\/anime\/external\?mal_id=999999999$/, status: 404, response: { message: 'Not Found' } },
  { url: /\/external\/watchlist\?anime_id=222242443$/, response: [narutoEntry] },
  {
    url: /\/external\/watchlist\?status=currently-watching&limit=100$/,
    response: [narutoEntry],
  },
  // Not on the list.
  { url: /\/external\/watchlist\?anime_id=743814481$/, response: [] },
  { method: 'POST', url: /\/external\/watchlist$/, response: { created: false } },
];

setGlobals();
function setGlobals() {
  setConAndUtils();
  global.api = createProviderApi({
    tokenKey: 'animeoshiToken',
    xhr: createFixtureXhr(fixtures),
    unauthorizedResponse: { status: 401, response: { message: 'Bad token' } },
  });

  global.testData = {
    urlTest: [
      { url: 'https://www.animeoshi.com/anime/222242443', error: false, type: 'anime' },
      { url: 'https://myanimelist.net/anime/20/Naruto', error: false, type: 'anime' },
      { url: 'https://anilist.co/anime/20/Naruto', error: false, type: 'anime' },
      { url: 'https://myanimelist.net/manga/2/Berserk', error: true, type: 'manga' },
      { url: 'https://www.animeoshi.com/anime/naruto', error: true, type: 'anime' },
      { url: 'https://simkl.com/anime/38636/one-piece', error: true, type: 'anime' },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://www.animeoshi.com/anime/222242443',
        displayUrl: 'https://www.animeoshi.com/anime/naruto?utm_source=malsync',
        malUrl: 'https://myanimelist.net/anime/20',
        title: 'Naruto',
        eps: 220,
        vol: 0,
        image: 'https://media.animeoshi.com/anime/images/222242443.jpg',
        rating: '8.4',
        cacheKey: 20,
      },
      notOnListUrl: {
        url: 'https://www.animeoshi.com/anime/743814481',
        displayUrl: 'https://www.animeoshi.com/anime/tayo-the-little-bus-season-4?utm_source=malsync',
        malUrl: 'https://myanimelist.net/anime/38074',
        // The anime endpoint returns no title, so it falls back to the slug.
        title: 'Tayo The Little Bus Season 4',
        eps: 26,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://myanimelist.net/anime/999999999/Nonexistent',
      },
    },
  };
}

describe('AnimeOshi Single', function () {
  before(function () {
    setGlobals();
  });

  generalSingleTests(Single, setGlobals);

  describe('List', function () {
    it('asks the api for one status and maps the entry', async function () {
      const list = new UserList(1, 'anime');
      const items = await list.getPart();

      expect(items.length).equal(1);
      expect(items[0].title).equal('Naruto');
      expect(items[0].status).equal(1);
      expect(items[0].watchedEp).equal(12);
      expect(items[0].image).equal('https://media.animeoshi.com/anime/images/222242443.jpg');
      expect(items[0].url).equal('https://www.animeoshi.com/anime/222242443');
      expect(list.isDone()).equal(true);
    });
  });

  describe('Sync', function () {
    it('maps the watchlist status and progress', async function () {
      const single = new Single('https://www.animeoshi.com/anime/222242443');
      await single.update();
      expect(single.getStatus()).equal(1); // Currently Watching
      expect(single.getEpisode()).equal(12);

      single.setStatus(23); // Rewatching is not supported and collapses to Watching
      single.setEpisode(13);

      const sent: any[] = [];
      const inner = global.api.request.xhr;
      global.api.request.xhr = (method, conf) => {
        sent.push({ method, data: JSON.parse(conf.data) });
        return inner(method, conf);
      };
      await (single as any)._sync();

      expect(sent[0].method).equal('POST');
      expect(sent[0].data).deep.equal({
        anime_id: 222242443,
        mal_status: 1,
        episode_number: 13,
      });
    });
  });
});
