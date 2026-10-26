import { expect } from 'chai';
import {
  RULE_SET_STRATEGIES,
  covers,
  getWholeSeasonEntry,
} from '../../../src/_provider/Search/ruleSetStrategies';
import type { TvdbTypedRule } from '../../../src/_provider/Search/rulesClass';

function rule(values: Partial<TvdbTypedRule>): TvdbTypedRule {
  return {
    source: 'tvdb',
    type: 'season',
    season: 1,
    provider: 'mal',
    id: 1,
    start: 1,
    end: 12,
    episodeStart: 1,
    absoluteStart: null,
    ...values,
  };
}

const ids = (rules: TvdbTypedRule[]) => rules.map(el => el.id);

describe('Rule set strategies', function () {
  describe('covers', function () {
    const twelve = rule({ start: 1, end: 12 });

    it('Episodes of the range', function () {
      expect(covers(twelve, 1, 1)).to.equal(true);
      expect(covers(twelve, 12, 1)).to.equal(true);
    });

    it('Episodes outside the range', function () {
      expect(covers(twelve, 0, 1)).to.equal(false);
      expect(covers(twelve, 13, 1)).to.equal(false);
    });

    it('Open-ended', function () {
      expect(covers(rule({ end: null }), 1000, 1)).to.equal(true);
    });

    it('Moves the range to the start', function () {
      expect(covers(twelve, 25, 25)).to.equal(true);
      expect(covers(twelve, 36, 25)).to.equal(true);
      expect(covers(twelve, 37, 25)).to.equal(false);
      expect(covers(twelve, 12, 25)).to.equal(false);
    });
  });

  describe('getWholeSeasonEntry', function () {
    it('One entry mapped with gaps', function () {
      const rules = [
        rule({ type: 'mapping', id: 5, start: 7, end: 12, episodeStart: 8 }),
        rule({ type: 'mapping', id: 5, start: 1, end: 6, episodeStart: 1 }),
      ];
      const entry = getWholeSeasonEntry(rules);
      expect(entry).to.include({ id: 5, start: 1, episodeStart: 1, end: null });
      // Does not change the rule
      expect(rules[1].end).to.equal(6);
    });

    it('Not for an empty season', function () {
      expect(getWholeSeasonEntry([])).to.equal(undefined);
    });

    it('Not for other rule types', function () {
      const rules = [
        rule({ type: 'mapping', id: 5, start: 1, end: 6 }),
        rule({ type: 'cour', id: 5, start: 7, end: 12 }),
      ];
      expect(getWholeSeasonEntry(rules)).to.equal(undefined);
    });

    it('Not for multiple entries', function () {
      const rules = [
        rule({ type: 'mapping', id: 5, start: 1, end: 6 }),
        rule({ type: 'mapping', id: 6, start: 7, end: 12 }),
      ];
      expect(getWholeSeasonEntry(rules)).to.equal(undefined);
    });

    it('Not if the season or the entry does not start at 1', function () {
      expect(getWholeSeasonEntry([rule({ type: 'mapping', start: 2 })])).to.equal(undefined);
      expect(getWholeSeasonEntry([rule({ type: 'mapping', episodeStart: 2 })])).to.equal(undefined);
    });
  });

  describe('off', function () {
    it('No rules', function () {
      const rules = [rule({})];
      expect(RULE_SET_STRATEGIES.off.select(rules, { season: 1, inferred: false })).to.eql([]);
      expect(RULE_SET_STRATEGIES.off.all(rules)).to.eql([]);
    });
  });

  describe('tvdb', function () {
    const rules = [
      rule({ id: 1, season: 1 }),
      rule({ id: 2, season: 2, type: 'mapping' }),
      rule({ id: 3, season: 2, type: 'cour' }),
    ];

    it('All rules of the season', function () {
      expect(ids(RULE_SET_STRATEGIES.tvdb.select(rules, { season: 2, inferred: false }))).to.eql([
        2, 3,
      ]);
      expect(ids(RULE_SET_STRATEGIES.tvdb.select(rules, { season: 2, inferred: true }))).to.eql([
        2, 3,
      ]);
    });

    it('No rules for an unknown season', function () {
      expect(RULE_SET_STRATEGIES.tvdb.select(rules, undefined)).to.eql([]);
    });

    it('Rules of all seasons', function () {
      expect(ids(RULE_SET_STRATEGIES.tvdb.all(rules))).to.eql([1, 2, 3]);
    });

    it('Starts at the season episode', function () {
      expect(RULE_SET_STRATEGIES.tvdb.start(rule({ start: 13, absoluteStart: 37 }))).to.equal(13);
    });
  });

  describe('cour', function () {
    const cours = [
      rule({ id: 10, type: 'cour', start: 1, end: 12 }),
      rule({ id: 11, type: 'cour', start: 13, end: 24 }),
      rule({ id: 12, type: 'mapping', start: 25, end: 25 }),
    ];

    it('Provided season: cours and seasons, without mappings', function () {
      const rules = [...cours, rule({ id: 20, season: 1, type: 'season' })];
      expect(ids(RULE_SET_STRATEGIES.cour.select(rules, { season: 1, inferred: false }))).to.eql([
        10, 11, 20,
      ]);
    });

    it('Provided season: the whole season entry', function () {
      const rules = [
        rule({ id: 5, type: 'mapping', start: 1, end: 6 }),
        rule({ id: 5, type: 'mapping', start: 8, end: 12, episodeStart: 7 }),
      ];
      const selected = RULE_SET_STRATEGIES.cour.select(rules, { season: 1, inferred: false });
      expect(selected).to.have.length(1);
      expect(selected[0]).to.include({ id: 5, start: 1, end: null });
    });

    it('Inferred season: later cours only', function () {
      expect(ids(RULE_SET_STRATEGIES.cour.select(cours, { season: 1, inferred: true }))).to.eql([
        11,
      ]);
    });

    it('Inferred season: first part split into multiple rules', function () {
      const rules = [
        rule({ id: 10, type: 'cour', start: 1, end: 6 }),
        rule({ id: 10, type: 'cour', start: 7, end: 12 }),
        rule({ id: 11, type: 'cour', start: 13, end: 24 }),
      ];
      expect(ids(RULE_SET_STRATEGIES.cour.select(rules, { season: 1, inferred: true }))).to.eql([
        11,
      ]);
    });

    it('Inferred season: no rules for whole seasons', function () {
      const rules = [rule({ id: 20, type: 'season' })];
      expect(RULE_SET_STRATEGIES.cour.select(rules, { season: 1, inferred: true })).to.eql([]);
    });

    it('No rules for an unknown season', function () {
      expect(RULE_SET_STRATEGIES.cour.select(cours, undefined)).to.eql([]);
    });

    it('Rules of all seasons keep the first part', function () {
      const rules = [...cours, rule({ id: 30, season: 2, type: 'season' })];
      expect(ids(RULE_SET_STRATEGIES.cour.all(rules))).to.eql([10, 11, 30]);
    });
  });

  describe('absolute', function () {
    const rules = [
      rule({ id: 1, season: 1, absoluteStart: 1 }),
      rule({ id: 2, season: 2, absoluteStart: 13 }),
      rule({ id: 3, season: 0, absoluteStart: null }),
    ];

    it('Rules with an absolute episode, seasons do not matter', function () {
      expect(ids(RULE_SET_STRATEGIES.absolute.select(rules, { season: 1, inferred: false }))).to.eql(
        [1, 2],
      );
      expect(ids(RULE_SET_STRATEGIES.absolute.select(rules, undefined))).to.eql([1, 2]);
      expect(ids(RULE_SET_STRATEGIES.absolute.all(rules))).to.eql([1, 2]);
    });

    it('Starts at the absolute episode', function () {
      expect(RULE_SET_STRATEGIES.absolute.start(rule({ start: 1, absoluteStart: 13 }))).to.equal(
        13,
      );
      expect(RULE_SET_STRATEGIES.absolute.start(rule({ start: 5, absoluteStart: null }))).to.equal(
        5,
      );
    });
  });
});
