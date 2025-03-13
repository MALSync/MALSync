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
        .regexFunction('pattern', 1)
        .run();

      expect(result).to.deep.equal([
        ['string', 'hello'],
        ['regexFunction', 'pattern', 1]
      ]);
    });
  });
});
