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
      providerName: null,
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
      providerName: null,
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
      providerName: null,
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
      providerName: 'Mushoku Tensei: Isekai Ittara Honki Dasu Part 2',
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
      providerName: null,
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
      providerName: null,
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
      providerName: null,
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
      providerName: null,
    },
  ],
  ids: { anidb: [], mal: [39535, 45576, 51179, 55888, 99999], anilist: [108465, 127720] },
};

// Trimmed from https://api.malsync.moe/tvdb/rules/cache-key/17074, season 3 is one entry with specials in between
const monogatariRule = (season, id, start, end, episodeStart, type, absoluteStart) => ({
  source: 'tvdb',
  type,
  season,
  provider: 'mal',
  id,
  start,
  end,
  episodeStart,
  absoluteStart,
  providerName: null,
});
const monogatari = {
  tvdbId: 102261,
  rules: [
    monogatariRule(0, 15689, 3, 6, 1, 'mapping', null),
    monogatariRule(0, 17074, 7, 7, 6, 'mapping', null),
    monogatariRule(0, 17074, 8, 8, 11, 'mapping', null),
    monogatariRule(0, 17074, 9, 9, 16, 'mapping', null),
    monogatariRule(1, 5081, 1, 15, 1, 'season', 1),
    monogatariRule(2, 11597, 1, 11, 1, 'season', 16),
    monogatariRule(3, 17074, 1, 5, 1, 'mapping', 27),
    monogatariRule(3, 17074, 6, 9, 7, 'mapping', 32),
    monogatariRule(3, 17074, 10, 13, 12, 'mapping', 36),
    monogatariRule(3, 17074, 14, 23, 17, 'mapping', 40),
  ],
  ids: { anidb: [], mal: [15689, 5081, 11597, 17074], anilist: [] },
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
              providerName: null,
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
              providerName: null,
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
              providerName: null,
            },
          ],
          ids: { anidb: [], mal: [2, 3], anilist: [] },
        }),
        status: 200,
      },
      'https://api.malsync.moe/tvdb/rules/cache-key/17074': {
        responseText: JSON.stringify(monogatari),
        status: 200,
      },
      'https://api.malsync.moe/tvdb/rules/cache-key/11597': {
        responseText: JSON.stringify(monogatari),
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

  describe('Whole season entry', function () {
    it('Cour uses the entry of a provided season without changing the episode', async function () {
      const rules = await new RulesClass('11597', 'anime').init();
      expect(rules.applyRules(6, 3, 'cour')).to.eql({
        url: 'https://myanimelist.net/anime/17074',
        offset: 0,
      });
      // tvdb skips the special
      expect(rules.applyRules(6, 3, 'tvdb')).to.eql({
        url: 'https://myanimelist.net/anime/17074',
        offset: 1,
      });
    });

    it('Never infers the specials season', async function () {
      const rules = await new RulesClass('17074', 'anime').init();
      // Episode 6 of the entry is the special S0E7, the regular season is inferred
      expect(rules.getEpisodeSeasonRules(6, undefined, 'tvdb').map(rule => rule.season)).to.eql([
        3, 3, 3, 3,
      ]);
      expect(rules.applyRules(6, undefined, 'tvdb')).to.eql({
        url: 'https://myanimelist.net/anime/17074',
        offset: 1,
      });
    });

    it('Not for an inferred season', async function () {
      const rules = await new RulesClass('11597', 'anime').init();
      expect(rules.applyRules(5, undefined, 'cour')).to.eql(undefined);
    });
  });

  describe('Search class', function () {
    const currentUrl = 'https://myanimelist.net/anime/39535';

    // Loaded lazily, its imports need the globals
    async function searchObj(page: string, identifier = 'rezero') {
      // eslint-disable-next-line global-require
      const { SearchClass } = require('../../../src/_provider/Search/searchClass');
      const obj = new SearchClass('Re:Zero', 'anime', identifier);
      obj.setPage({ name: page });
      obj.setUrl(currentUrl);
      obj.rules = await new RulesClass('39535', 'anime').init();
      await obj.loadRuleSet();
      return obj;
    }

    it('Applies the default rule set', async function () {
      const obj = await searchObj('default');
      expect(obj.getRuleSetSelection()).to.equal('auto');
      expect(obj.getRuleSet()).to.equal(DEFAULT_RULE_SET);
      expect(obj.getRuledUrl(12)).to.equal('https://myanimelist.net/anime/45576');
      expect(obj.getRuledOffset(12)).to.equal(-11);
    });

    it('Remembers the rule set', async function () {
      const obj = await searchObj('remember');
      await obj.setRuleSet('off');
      expect(await stub.storage.get('remember/tvdb/371310/RuleSet')).to.equal('off');
      expect(obj.getRuledUrl(12)).to.equal(currentUrl);

      const reloaded = await searchObj('remember');
      expect(reloaded.getRuleSet()).to.equal('off');
    });

    it('Shares the rule set within the series on the same page', async function () {
      const obj = await searchObj('series', 'season-1');
      await obj.setRuleSet('absolute');

      const otherEntry = await searchObj('series', 'season-2');
      expect(otherEntry.getRuleSet()).to.equal('absolute');

      const otherPage = await searchObj('series-other-page', 'season-1');
      expect(otherPage.getRuleSet()).to.equal(DEFAULT_RULE_SET);
    });

    it('Conflict: episode higher than the season uses absolute numbering', async function () {
      const obj = await searchObj('conflict');
      const conflict = obj.getRuleConflict(32);
      expect(conflict?.season).to.equal(1);
      expect(conflict?.episode).to.equal(32);
      // Tvdb is not compared for an inferred season
      expect(conflict?.options).to.eql([
        { ruleSets: ['cour'], url: currentUrl, episode: 32 },
        {
          ruleSets: ['absolute'],
          url: 'https://myanimelist.net/anime/51179',
          episode: 9,
          season: 2,
          title: null,
        },
      ]);
    });

    it('Conflict: mapping rules differ from cour', async function () {
      const obj = await searchObj('conflict-mapping');
      const conflict = obj.getRuleConflict(40, 2);
      expect(conflict?.options.map(el => [el.ruleSets, el.url, el.episode])).to.eql([
        [['cour'], currentUrl, 40],
        [['tvdb'], 'https://myanimelist.net/anime/99999', 31],
      ]);
    });

    it('No conflict if cour and tvdb find the same episode of the whole season entry', async function () {
      const obj = await searchObj('conflict-whole');
      obj.setUrl('https://myanimelist.net/anime/11597');
      obj.rules = await new RulesClass('11597', 'anime').init();
      expect(obj.getRuledUrl(5, 3)).to.equal('https://myanimelist.net/anime/17074');
      expect(obj.getRuleConflict(5, 3)).to.eql(undefined);
    });

    it('Conflict if tvdb skips specials of the whole season entry', async function () {
      const obj = await searchObj('conflict-whole-specials');
      obj.setUrl('https://myanimelist.net/anime/11597');
      obj.rules = await new RulesClass('11597', 'anime').init();
      expect(
        obj.getRuleConflict(6, 3)?.options.map(el => [el.ruleSets, el.url, el.episode]),
      ).to.eql([
        [['cour'], 'https://myanimelist.net/anime/17074', 6],
        [['tvdb'], 'https://myanimelist.net/anime/17074', 7],
      ]);
    });

    it('No tvdb conflict for an inferred season', async function () {
      const obj = await searchObj('conflict-inferred');
      obj.setUrl('https://myanimelist.net/anime/17074');
      obj.rules = await new RulesClass('17074', 'anime').init();
      // Tvdb would read episode 6 of the entry as S3E6 and skip the special
      expect(obj.getRuleConflict(6)).to.eql(undefined);
      expect(obj.getRuleConflict(6, 3)?.options.length).to.equal(2);
    });

    it('No conflict if a rule applies', async function () {
      const obj = await searchObj('conflict-rule');
      expect(obj.getRuleConflict(12)).to.eql(undefined);
    });

    it('No conflict inside the season', async function () {
      const obj = await searchObj('conflict-inside');
      expect(obj.getRuleConflict(5, 1)).to.eql(undefined);
    });

    it('No conflict after the user selected a rule set', async function () {
      const obj = await searchObj('conflict-selected');
      await obj.setRuleSet(obj.getRuleSet());
      expect(obj.getRuleConflict(32)).to.eql(undefined);

      const reloaded = await searchObj('conflict-selected');
      expect(reloaded.getRuleConflict(32)).to.eql(undefined);
    });

    it('Asks again after switching back to auto', async function () {
      const obj = await searchObj('conflict-auto');
      await obj.setRuleSet('cour');
      expect(obj.getRuleConflict(32)).to.eql(undefined);

      obj.changed = false;
      await obj.setRuleSet('auto');
      expect(obj.changed).to.equal(true);
      expect(obj.getRuleSet()).to.equal(DEFAULT_RULE_SET);
      expect(obj.getRuleConflict(32)?.options.length).to.equal(2);

      const reloaded = await searchObj('conflict-auto');
      expect(reloaded.getRuleSetSelection()).to.equal('auto');
    });
  });
});
