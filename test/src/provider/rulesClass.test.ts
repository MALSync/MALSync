import { expect } from 'chai';
import { DEFAULT_RULE_SET, RulesClass } from '../../../src/_provider/Search/rulesClass';
import * as Api from '../utils/apiStub';

Api.setGlobals();

// Trimmed from https://api.malsync.moe/tvdb/rules/cache-key/39535
const ruleSet = {
  tvdbId: 371310,
  rules: [
    {
      source: 'tvdb',
      type: 'season',
      season: 3,
      provider: 'mal',
      id: 59193,
      start: 1,
      end: 14,
      episodeStart: 1,
      absoluteStart: 48,
    },
    {
      source: 'tvdb',
      type: 'cour',
      season: 1,
      provider: 'mal',
      id: 39535,
      start: 1,
      end: 11,
      episodeStart: 1,
      absoluteStart: 1,
    },
    {
      source: 'tvdb',
      type: 'cour',
      season: 1,
      provider: 'anilist',
      id: 108465,
      start: 1,
      end: 11,
      episodeStart: 1,
      absoluteStart: 1,
    },
    {
      source: 'tvdb',
      type: 'cour',
      season: 1,
      provider: 'mal',
      id: 45576,
      start: 12,
      end: 23,
      episodeStart: 1,
      absoluteStart: 12,
    },
    {
      source: 'tvdb',
      type: 'cour',
      season: 1,
      provider: 'anilist',
      id: 127720,
      start: 12,
      end: 23,
      episodeStart: 1,
      absoluteStart: 12,
    },
    {
      source: 'tvdb',
      type: 'cour',
      season: 2,
      provider: 'mal',
      id: 51179,
      start: 1,
      end: 12,
      episodeStart: 1,
      absoluteStart: 24,
    },
    {
      source: 'tvdb',
      type: 'cour',
      season: 2,
      provider: 'mal',
      id: 55888,
      start: 13,
      end: 24,
      episodeStart: 1,
      absoluteStart: 36,
    },
    // Overlapping rule, not part of the real response
    {
      source: 'tvdb',
      type: 'mapping',
      season: 2,
      provider: 'mal',
      id: 99999,
      start: 10,
      end: null,
      episodeStart: 1,
      absoluteStart: 33,
    },
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
      'https://api.malsync.moe/tvdb/rules/cache-key/59193': {
        responseText: JSON.stringify(ruleSet),
        status: 200,
      },
      'https://api.malsync.moe/tvdb/rules/cache-key/45576': {
        responseText: JSON.stringify(ruleSet),
        status: 200,
      },
      'https://api.malsync.moe/tvdb/rules/cache-key/anilist:108465': {
        responseText: JSON.stringify(ruleSet),
        status: 200,
      },
      // First part split into multiple rules
      'https://api.malsync.moe/tvdb/rules/cache-key/2': {
        responseText: JSON.stringify({
          tvdbId: 1,
          rules: [
            {
              source: 'tvdb',
              type: 'cour',
              season: 1,
              provider: 'mal',
              id: 2,
              start: 1,
              end: 6,
              episodeStart: 1,
              absoluteStart: 1,
            },
            {
              source: 'tvdb',
              type: 'cour',
              season: 1,
              provider: 'mal',
              id: 2,
              start: 7,
              end: 11,
              episodeStart: 7,
              absoluteStart: 7,
            },
            {
              source: 'tvdb',
              type: 'cour',
              season: 1,
              provider: 'mal',
              id: 3,
              start: 12,
              end: 23,
              episodeStart: 1,
              absoluteStart: 12,
            },
          ],
          ids: { anidb: [], mal: [2, 3], anilist: [] },
        }),
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
        name: 'No rules without season',
        id: '1',
        episode: 1,
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
        expect(rules.applyRules(test.episode, test.season, 'tvdb')).to.eql(test.result);
      });
    });
  });

  describe('Inferred season', function () {
    it('Season of the entry episode', async function () {
      const rules = await new RulesClass('45576', 'anime').init();
      const seasons = episode => [
        ...new Set(rules.getEpisodeSeasonRules(episode, undefined, 'tvdb').map(r => r.season)),
      ];
      expect(seasons(5)).to.eql([1]);
      expect(seasons(13)).to.eql([1]);
    });

    it('Continuous counting', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      expect(rules.applyRules(12, undefined, 'tvdb')).to.eql({
        url: 'https://myanimelist.net/anime/45576',
        offset: -11,
      });
    });

    it('Provided season is not inferred', async function () {
      const rules = await new RulesClass('45576', 'anime').init();
      expect(rules.getMatches(5, 2, 'tvdb').map(el => el.url)).to.eql([
        'https://myanimelist.net/anime/51179',
      ]);
    });
  });

  describe('Multiple rules', function () {
    it('Sorted by start', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      const matches = rules.getMatches(13, 2, 'tvdb');
      expect(matches.map(el => el.url)).to.eql([
        'https://myanimelist.net/anime/55888',
        'https://myanimelist.net/anime/99999',
      ]);
      expect(matches.map(el => el.episode)).to.eql([1, 4]);
    });
  });

  describe('Rule sets', function () {
    it('Off', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      expect(rules.applyRules(12, 1, 'off')).to.eql(undefined);
    });

    it('Cour redirects to the next part', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      expect(rules.applyRules(5, undefined, 'cour')).to.eql(undefined);
      expect(rules.applyRules(12, undefined, 'cour')).to.eql({
        url: 'https://myanimelist.net/anime/45576',
        offset: -11,
      });
    });

    it('Cour ignores earlier parts', async function () {
      const rules = await new RulesClass('45576', 'anime').init();
      // tvdb redirects the second part with own numbering to the first part
      expect(rules.applyRules(5, undefined, 'tvdb')?.url).to.equal(
        'https://myanimelist.net/anime/39535',
      );
      expect(rules.applyRules(5, undefined, 'cour')).to.eql(undefined);
    });

    it('Cour applies to the part of the current entry', async function () {
      const rules = await new RulesClass('45576', 'anime').init();
      expect(rules.applyRules(13, 1, 'cour')).to.eql({
        url: 'https://myanimelist.net/anime/45576',
        offset: -11,
      });
    });

    it('Cour rules of all seasons', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      // No inferred season, first parts are kept. 99999 is typed as mapping
      expect(rules.getRuleSetRules('cour').map(rule => rule.id)).to.eql([
        59193, 39535, 45576, 51179, 55888,
      ]);
    });

    it('Cour keeps the first part with a provided season', async function () {
      const rules = await new RulesClass('45576', 'anime').init();
      expect(rules.applyRules(5, 1, 'cour')).to.eql({
        url: 'https://myanimelist.net/anime/39535',
        offset: 0,
      });
    });

    it('Cour includes whole seasons with a provided season', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      expect(rules.applyRules(5, 3, 'cour')).to.eql({
        url: 'https://myanimelist.net/anime/59193',
        offset: 0,
      });
    });

    it('Cour skips whole seasons with an inferred season', async function () {
      const rules = await new RulesClass('59193', 'anime').init();
      expect(rules.applyRules(5, undefined, 'cour')).to.eql(undefined);
    });

    it('Cour with a split first part', async function () {
      const rules = await new RulesClass('2', 'anime').init();
      // Inferred season skips both rules of the first part
      expect(rules.applyRules(8, undefined, 'cour')).to.eql(undefined);
      expect(rules.getEpisodeSeasonRules(8, undefined, 'cour').map(rule => rule.id)).to.eql([3]);
    });

    it('Absolute numbering across seasons', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      expect(rules.applyRules(12, undefined, 'absolute')).to.eql({
        url: 'https://myanimelist.net/anime/45576',
        offset: -11,
      });
      expect(rules.applyRules(30, undefined, 'absolute')).to.eql({
        url: 'https://myanimelist.net/anime/51179',
        offset: -23,
      });
      expect(rules.applyRules(50, undefined, 'absolute')).to.eql({
        url: 'https://myanimelist.net/anime/59193',
        offset: -47,
      });
    });

    it('Absolute ignores the season', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      expect(rules.applyRules(30, 1, 'absolute')?.url).to.equal(
        'https://myanimelist.net/anime/51179',
      );
    });
  });

  describe('Search class', function () {
    const currentUrl = 'https://myanimelist.net/anime/39535';

    // Loaded lazily, its imports need the globals
    async function searchObj(identifier: string) {
      // eslint-disable-next-line global-require
      const { SearchClass } = require('../../../src/_provider/Search/searchClass');
      const obj = new SearchClass('Re:Zero', 'anime', identifier);
      obj.setPage({ name: 'test' });
      obj.setUrl(currentUrl);
      obj.rules = await new RulesClass('39535', 'anime').init();
      await obj.loadRuleSet();
      return obj;
    }

    it('Applies the default rule set', async function () {
      const obj = await searchObj('default');
      expect(obj.getRuleSet()).to.equal(DEFAULT_RULE_SET);
      expect(obj.getRuledUrl(12)).to.equal('https://myanimelist.net/anime/45576');
      expect(obj.getRuledOffset(12)).to.equal(-11);
    });

    it('Remembers the rule set', async function () {
      const obj = await searchObj('remember');
      await obj.setRuleSet('off');
      expect(await stub.storage.get('test/remember/RuleSet')).to.equal('off');
      expect(obj.getRuledUrl(12)).to.equal(currentUrl);

      const reloaded = await searchObj('remember');
      expect(reloaded.getRuleSet()).to.equal('off');
    });
  });
});
