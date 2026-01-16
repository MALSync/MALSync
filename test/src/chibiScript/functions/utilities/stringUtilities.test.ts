import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../../src/chibiScript/ChibiConsumer';

describe('String Utilities Functions', () => {
  describe('slugify function', () => {
    it('slugify a string', () => {
      const code = $c.string('1 World/s\n-\n\n New').slugify().run();
      expect(generateAndExecute(code).run()).to.equal('1-worlds-new');
    });
    it('slugify a string with replacement rules through array and chibi', () => {
      const code = $c
        .string('100%\nWorld\n&-\n☢')
        .slugify([
          ['%', 'percent'],
          [$c.string('☢').run(), $c.string('radiation').run()],
          ['&', 'and'],
        ])
        .run();
      expect(generateAndExecute(code).run()).to.equal('100percent-world-and-radiation');
    });
    it('slugify a string with replacement rules through object and chibi', () => {
      const code = $c
        .string('100%\nWorld\n&-\n☢')
        .slugify({
          '%': 'percent',
          '☢': $c.string('radiation').run(),
          '&': 'and',
        })
        .run();
      expect(generateAndExecute(code).run()).to.equal('100percent-world-and-radiation');
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);
  return consumer;
}
