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
      type: 'cour',
      season: 1,
      provider: 'mal',
      id: 39535,
      start: 1,
      end: 11,
      episodeStart: 1,
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
    },
  ],
  ids: { anidb: [], mal: [39535, 45576, 51179, 55888, 99999], anilist: [108465, 127720] },
};

// Rules with the full tvdb rule set, independent of the default
async function tvdbRules(id: string) {
  const rules = await new RulesClass(id, 'anime').init();
  await rules.setRuleSet('tvdb');
  return rules;
}

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
        const rules = await tvdbRules(test.id);
        expect(rules.applyRules(test.episode, test.season)).to.eql(test.result);
      });
    });
  });

  describe('Inferred season', function () {
    it('Season of the entry episode', async function () {
      const rules = await tvdbRules('45576');
      const seasons = episode => [
        ...new Set(rules.getEpisodeSeasonRules(episode).map(r => r.season)),
      ];
      expect(seasons(5)).to.eql([1]);
      expect(seasons(13)).to.eql([1]);
    });

    it('Continuous counting', async function () {
      const rules = await tvdbRules('39535');
      expect(rules.applyRules(12)).to.eql({
        url: 'https://myanimelist.net/anime/45576',
        offset: -11,
      });
    });

    it('Provided season is not inferred', async function () {
      const rules = await tvdbRules('45576');
      expect(rules.getMatches(5, 2).map(el => el.url)).to.eql([
        'https://myanimelist.net/anime/51179',
      ]);
    });
  });

  describe('Multiple rules', function () {
    it('Sorted by start', async function () {
      const rules = await tvdbRules('39535');
      const matches = rules.getMatches(13, 2);
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
      await rules.setRuleSet('off');
      expect(rules.applyRules(12, 1)).to.eql(undefined);
    });

    it('Cour redirects to the next part', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      await rules.setRuleSet('cour');
      expect(rules.applyRules(5)).to.eql(undefined);
      expect(rules.applyRules(12)).to.eql({
        url: 'https://myanimelist.net/anime/45576',
        offset: -11,
      });
    });

    it('Cour ignores earlier parts', async function () {
      const rules = await tvdbRules('45576');
      // tvdb redirects the second part with own numbering to the first part
      expect(rules.applyRules(5)?.url).to.equal('https://myanimelist.net/anime/39535');
      await rules.setRuleSet('cour');
      expect(rules.applyRules(5)).to.eql(undefined);
    });

    it('Cour applies to the part of the current entry', async function () {
      const rules = await new RulesClass('45576', 'anime').init();
      await rules.setRuleSet('cour');
      expect(rules.applyRules(13, 1)).to.eql({
        url: 'https://myanimelist.net/anime/45576',
        offset: -11,
      });
    });

    it('Cour rules of all seasons', async function () {
      const rules = await new RulesClass('39535', 'anime').init();
      await rules.setRuleSet('cour');
      // 99999 is typed as mapping
      expect(rules.getRuleSetRules().map(rule => rule.id)).to.eql([45576, 55888]);
    });

    it('Cour with a split first part', async function () {
      const rules = await new RulesClass('2', 'anime').init();
      await rules.setRuleSet('cour');
      expect(rules.getRuleSetRules().map(rule => rule.id)).to.eql([3]);
      expect(rules.applyRules(8, 1)).to.eql(undefined);
    });

    it('Remembers the rule set', async function () {
      const rules = await new RulesClass('39535', 'anime', 'test/rezero/RuleSet').init();
      expect(rules.getRuleSet()).to.equal(DEFAULT_RULE_SET);
      await rules.setRuleSet('off');
      expect(await stub.storage.get('test/rezero/RuleSet')).to.equal('off');

      const reloaded = await new RulesClass('39535', 'anime', 'test/rezero/RuleSet').init();
      expect(reloaded.getRuleSet()).to.equal('off');
    });
  });
});
