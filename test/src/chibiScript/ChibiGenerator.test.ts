import { expect } from 'chai';
import { $c } from '../../../src/chibiScript/ChibiGenerator';

describe('ChibiGenerator', () => {
  describe('function chaining', () => {
    it('should allow chaining string functions', () => {
      const result = $c.string('test').run();
      expect(result).to.deep.equal([['string', 'test']]);
    });

    it('should chain multiple functions correctly', () => {
      const result = $c
        .string('hello')
        .regex('pattern', 1)
        .run();

      expect(result).to.deep.equal([
        ['string', 'hello'],
        ['regex', 'pattern', 1]
      ]);
    });

    it('should generate random key for waitUntilTrue parameter', () => {
      const result = $c.waitUntilTrue($c.boolean(true).run()).run();

      // Check that the third parameter (index 2) is a random key
      expect(result[0][0]).to.equal('waitUntilTrue');
      expect(result[0][2]).to.be.a('string');
      expect(result[0][2]).to.include('waitUntilTrue');
      expect(result[0][2]).to.match(/^waitUntilTrue[a-zA-Z0-9]+$/);
    });

    it('should generate different random keys for multiple waitUntilTrue calls', () => {
      const result1 = $c.waitUntilTrue($c.boolean(true).run()).run();
      const result2 = $c.waitUntilTrue($c.boolean(true).run()).run();

      // Keys should be different
      expect(result1[0][2]).to.not.equal(result2[0][2]);

      // But both should follow the pattern
      expect(result1[0][2]).to.match(/^waitUntilTrue[a-zA-Z0-9]+$/);
      expect(result2[0][2]).to.match(/^waitUntilTrue[a-zA-Z0-9]+$/);
    });

    it('should generate random key for detectChanges parameter', () => {
      const result = $c.detectChanges(
        $c.string('target').run(),
        $c.string('callback').run()
      ).run();

      // Check that the fourth parameter (index 3) is a random key
      expect(result[0][0]).to.equal('detectChanges');
      expect(result[0][3]).to.be.a('string');
      expect(result[0][3]).to.include('detectChanges');
      expect(result[0][3]).to.match(/^detectChanges[a-zA-Z0-9]+$/);
    });

    describe('Utility functions', () => {
      it('String parameter', () => {
        const result = $c.string('Line1\nLine2\rLine3').replaceLinebreaks(', ').run();

        expect(result).to.deep.equal([
          ['string', 'Line1\nLine2\rLine3'],
          ['replaceRegex', '(\n|\r)', ', '],
          ['replaceRegex', ' +', ' '],
          ['trim'],
        ]);
      });
      it('ChibiJson parameter', () => {
        const result = $c
          .string('Line1\nLine2\rLine3')
          .replaceLinebreaks($c.string(', ').run())
          .run();

        expect(result).to.deep.equal([
          ['string', 'Line1\nLine2\rLine3'],
          ['replaceRegex', '(\n|\r)', [
            [
              "string",
              ", "
            ]
          ]],
          [
            "replaceRegex",
            " +",
            " "
          ],
          [
            "trim"
          ]
        ]);
      });
    });
  });
});
