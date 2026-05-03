import { expect } from 'chai';
import { $c, ChibiJson } from '../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../src/chibiScript/ChibiConsumer';

// These tests validate the chibi composition used in Crunchyroll's getEpisode
// for arc-grouped long-running shows where partOfSeason.name encodes an
// absolute episode range like "Thriller Bark (337-381)". The composition
// mirrors getEpisodeRangeOffset / hasEpisodeRange in
// src/pages-chibi/implementations/Crunchyroll/main.ts but feeds a literal
// season name instead of reading it from JSON-LD, so the assertion isolates
// the offset logic from DOM/JSON-LD parsing.

function offsetFromSeasonName(seasonName: string) {
  const code = $c
    .if(
      $c.string(seasonName).matches('\\(\\d+-\\d+\\)').run(),
      $c
        .string(seasonName)
        .regex('\\((\\d+)-\\d+\\)', 1)
        .number()
        .calculate('-', 1)
        .run(),
      $c.number(0).run(),
    )
    .run();
  return generateAndExecute(code).run();
}

function absoluteEpisode(seasonName: string, rawEpisodeNumber: number) {
  const code = $c
    .number(rawEpisodeNumber)
    .calculate(
      '+',
      $c
        .if(
          $c.string(seasonName).matches('\\(\\d+-\\d+\\)').run(),
          $c
            .string(seasonName)
            .regex('\\((\\d+)-\\d+\\)', 1)
            .number()
            .calculate('-', 1)
            .run(),
          $c.number(0).run(),
        )
        .run(),
    )
    .run();
  return generateAndExecute(code).run();
}

describe('Crunchyroll arc-range episode offset', () => {
  describe('offsetFromSeasonName', () => {
    it('returns rangeStart - 1 when season name encodes an absolute range', () => {
      // One Piece "Thriller Bark" arc: episodes 337-381 absolute
      expect(offsetFromSeasonName('Thriller Bark (337-381)')).to.equal(336);
    });

    it('handles a range starting at 1 (first arc)', () => {
      expect(offsetFromSeasonName('East Blue (1-61)')).to.equal(0);
    });

    it('handles a range deep into a long-running series', () => {
      expect(offsetFromSeasonName('Wano (892-1086)')).to.equal(891);
    });

    it('returns 0 when season name has no range pattern', () => {
      expect(offsetFromSeasonName('Naruto Season 3')).to.equal(0);
    });

    it('returns 0 for typical first-cour season names', () => {
      expect(offsetFromSeasonName('Re:ZERO -Starting Life in Another World-')).to.equal(0);
    });

    it('returns 0 when parentheses contain non-range content', () => {
      expect(offsetFromSeasonName('Yano-kun (Subbed)')).to.equal(0);
    });

    it('returns 0 when only a single number is in parentheses', () => {
      expect(offsetFromSeasonName('Some Show (12)')).to.equal(0);
    });
  });

  describe('absoluteEpisode (composed: episodeNumber + offset)', () => {
    it('reconstructs absolute episode for One Piece Thriller Bark E43 → 379', () => {
      // Reproduction case: the 43rd episode of the Thriller Bark arc (337-381)
      // displays on Crunchyroll as "E379" and is tracked by MAL as episode 379.
      expect(absoluteEpisode('Thriller Bark (337-381)', 43)).to.equal(379);
    });

    it('leaves episode unchanged for non-arc-grouped shows', () => {
      // Re:ZERO Season 3 episode 1 → still 1; no offset applied.
      expect(
        absoluteEpisode('Re:ZERO -Starting Life in Another World-', 1),
      ).to.equal(1);
    });

    it('leaves episode unchanged for Naruto-style "Season N" naming', () => {
      // Crunchyroll labels arcs as "Naruto Season 3" without an embedded range,
      // so the raw episodeNumber from JSON-LD is preserved.
      expect(absoluteEpisode('Naruto Season 3', 55)).to.equal(55);
    });

    it('preserves first-arc numbering when range starts at 1', () => {
      expect(absoluteEpisode('East Blue (1-61)', 8)).to.equal(8);
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);
  return consumer;
}
