import { expect } from 'chai';
import { $c } from '../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../src/chibiScript/ChibiConsumer';
import { chapterLabelNumber } from '../../../src/pages-chibi/implementations/Atsumaru/main';

function readChapterLabel(label: string) {
  return new ChibiConsumer(chapterLabelNumber($c.string(label)).run()).run();
}

describe('Atsumaru chapter label', () => {
  const cases: [string, number][] = [
    ['Chapter 12', 12],
    ['Chapter 131', 131],
    ['Chapter 06', 6],
    ['Chapter  220 Untold Stories 07', 220],
    ['Chapter 02 - After 9', 2],
    ['Chapter 1.5 Chapter 1 Remake', 1.5],
    ['Chapter 202 Season 3 Start', 202],
    ['Chapter 29 - A Divine Temple (2)', 29],
    ['Chapter 10 - Sichuan Tang Clan (4)', 10],
    ['Ep. 3', 3],
    ['Ep.5', 5],
    ['Ep. 3 - Back to 2006', 3],
    ['Ep. 4 - 2006 Queen Bee VS 2025 Influencer', 4],
    ['Ep. 31 - Jangmi Hong: Part 1', 31],
    ['Ep. 32 - Jangmi Hong: Part 2', 32],
    ['Ep. 37 - BFFs 4everUP', 37],
    ['Ep.88 - Love (4)', 88],
    ['Ep.88 - Love (4)UP', 88],
    ['Ep.10 - The Sichuan Tang Clan (4)', 10],
    ['Ep. 5 - Chapter 3 - Entering the Academy', 5],
    ['Episode 0', 0],
    ['Episode 12 of 24', 12],
    ['Episode 112 (Season 1 Finale)', 112],
    ['Ch. 37', 37],
    ['Ch. 112.3', 112.3],
    ['Ch 10.5', 10.5],
    ['Ch.#12', 12],
    ['Days 5', 5],
    ['Game 71', 71],
    ['Journey 10', 10],
    ['Page 20', 20],
    ['Retrace 8', 8],
    ['Vol. 2 Chapter 15', 15],
    ['Season 2 Episode 10', 10],
    ['3rd Chapter 12', 12],
    ['2nd', 2],
    ['Prologue 10', 10],
  ];

  for (const [label, expected] of cases) {
    it(`reads ${String(expected)} from "${label}"`, () => {
      expect(readChapterLabel(label)).to.equal(expected);
    });
  }
});
