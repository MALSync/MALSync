import { expect } from 'chai';
import { $c } from '../../../src/chibiScript/ChibiGenerator';

describe('ChibiGenerator', () => {
  describe('function chaining', () => {
    it('should allow chaining string functions', () => {
      const result = $c.stringFunction('test').run();
      expect(result).to.deep.equal([['stringFunction', 'test']]);
    });

    it('should chain multiple functions correctly', () => {
      const result = $c
        .stringFunction('hello')
        .regexFunction('pattern', 1)
        .run();

      expect(result).to.deep.equal([
        ['stringFunction', 'hello'],
        ['regexFunction', 'pattern', 1]
      ]);
    });
  });
});
