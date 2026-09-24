import { expect } from 'chai';
import { RulesClass } from '../../../src/_provider/Search/rulesClass';
import * as Api from '../utils/apiStub';

Api.setGlobals();

// Trimmed from https://api.malsync.moe/tvdb/rules/cache-key/39535
const ruleSet = {
  tvdbId: 371310,
  rules: [
    { season: 1, provider: 'mal', id: 39535, start: 1, end: 11, episodeStart: 1 },
    { season: 1, provider: 'anilist', id: 108465, start: 1, end: 11, episodeStart: 1 },
    { season: 1, provider: 'mal', id: 45576, start: 12, end: 23, episodeStart: 1 },
    { season: 1, provider: 'anilist', id: 127720, start: 12, end: 23, episodeStart: 1 },
    { season: 2, provider: 'mal', id: 51179, start: 1, end: 12, episodeStart: 1 },
    { season: 2, provider: 'mal', id: 55888, start: 13, end: 24, episodeStart: 1 },
    // Overlapping rule, not part of the real response
    { season: 2, provider: 'mal', id: 99999, start: 10, end: null, episodeStart: 1 },
  ],
  ids: { anidb: [], mal: [39535, 45576, 51179, 55888, 99999], anilist: [108465, 127720] },
};

describe('Rules', function () {
  const stub = Api.getStub({
    storage: {
      syncMode: 'MAL',
    },
    request: {
      'https://api.malsync.moe/tvdb/rules/cache-key/39535': {
        responseText: JSON.stringify(ruleSet),
        status: 200,
      },
      'https://api.malsync.moe/tvdb/rules/cache-key/anilist:108465': {
        responseText: JSON.stringify(ruleSet),
        status: 200,
      },
      'https://api.malsync.moe/tvdb/rules/cache-key/1': {
        responseText: 'null',
        status: 200,
      },
    },
  });

  before(function () {
    Api.setGlobals();
    Api.setStub(stub);
  });

  describe('Redirect', function () {
    [
      {
        name: 'No season',
        id: '39535',
        episode: 5,
        season: undefined,
        result: undefined,
      },
      {
        name: 'Same entry',
        id: '39535',
        episode: 5,
        season: 1,
        result: { url: 'https://myanimelist.net/anime/39535', offset: 0 },
      },
      {
        name: 'Next part',
        id: '39535',
        episode: 12,
        season: 1,
        result: { url: 'https://myanimelist.net/anime/45576', offset: -11 },
      },
      {
        name: 'Season 2',
        id: '39535',
        episode: 1,
        season: 2,
        result: { url: 'https://myanimelist.net/anime/51179', offset: 0 },
      },
      {
        name: 'No rule for season',
        id: '39535',
        episode: 1,
        season: 5,
        result: undefined,
      },
      {
        name: 'Anilist',
        id: 'anilist:108465',
        episode: 12,
        season: 1,
        result: { url: 'https://anilist.co/anime/127720', offset: -11 },
      },
      {
        name: 'No rules',
        id: '1',
        episode: 1,
        season: 1,
        result: undefined,
      },
    ].forEach(test => {
      it(test.name, async function () {
        const rules = await new RulesClass(test.id, 'anime').init();
        expect(rules.applyRules(test.episode, test.season)).to.eql(test.result);
      });
    });
  });

  describe('Multiple rules', function () {
    it('Sorted by start', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      const matches = rules.getMatches(13, 2);
      expect(matches.map(el => el.url)).to.eql([
        'https://myanimelist.net/anime/55888',
        'https://myanimelist.net/anime/99999',
      ]);
      expect(matches.map(el => el.episode)).to.eql([1, 4]);
    });

    it('Keep current entry', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      await rules.resolve(13, 2, 'https://myanimelist.net/anime/51179', async () => null);
      expect(rules.applyRules(13, 2)).to.eql(undefined);
    });
  });

  describe('Selection', function () {
    it('Asks once and remembers the selection', async function () {
      const currentUrl = 'https://myanimelist.net/anime/51179';
      const rules = await new RulesClass('39535', 'anime', 'test/rezero/RuleSelection').init();

      let asked = 0;
      const select = async matches => {
        asked++;
        return matches[1].key;
      };

      // Single rule for the current entry, nothing to ask
      await rules.resolve(5, 2, currentUrl, select);
      expect(asked).to.equal(0);

      await rules.resolve(13, 2, currentUrl, select);
      expect(asked).to.equal(1);
      expect(rules.applyRules(13, 2)).to.eql({
        url: 'https://myanimelist.net/anime/99999',
        offset: -9,
      });

      await rules.resolve(13, 2, currentUrl, select);
      expect(asked).to.equal(1);
      expect(await stub.storage.get('test/rezero/RuleSelection')).to.eql({
        '2:mal:55888:13,2:mal:99999:10': '2:mal:99999:10',
      });

      // Loaded from storage
      const reloaded = await new RulesClass('39535', 'anime', 'test/rezero/RuleSelection').init();
      await reloaded.resolve(13, 2, currentUrl, select);
      expect(asked).to.equal(1);
      expect(reloaded.applyRules(13, 2)?.url).to.equal('https://myanimelist.net/anime/99999');
    });
  });
});
