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

  describe('regexAutoGroup', () => {
    it('should repeat regex pattern group until it matches', () => {
      const code = $c.string('hello123world').regexAutoGroup('(mal)|(sync)|(\\d+)').run();
      expect(generateAndExecute(code).run()).to.equal('123');
    });

    it('should give undefined if nothing matches', () => {
      const code = $c.string('HELLO123').regexAutoGroup('(mal)|(sync)|(\\.)').run();
      expect(generateAndExecute(code).run()).to.be.undefined;
    });

    it('should handle ChibiJson', () => {
      const code = $c.string('hello123mal').regexAutoGroup($c.string('(sync)|(\\d+)|(mal)').run()).run();
      expect(generateAndExecute(code).run()).to.equal('123');
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);
  return consumer;
}
