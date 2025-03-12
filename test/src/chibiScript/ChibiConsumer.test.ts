import { expect } from 'chai';
import { $c, ChibiJson } from '../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../src/chibiScript/ChibiConsumer';
import { UnknownChibiFunctionError } from '../../../src/chibiScript/ChibiErrors';

describe('ChibiConsumer', () => {
  describe('function chaining', () => {
    it('should allow chaining string functions', () => {
      const code = $c.stringFunction('test').run();
      expect(generateAndExecute(code)).to.equal('test');
    });

    it('should chain multiple functions correctly', () => {
      const code = $c
        .stringFunction('hello')
        .regexFunction('e.', 0)
        .run();

      expect(generateAndExecute(code)).to.equal('el');
    });

    it('should chain ifFunction correctly', () => {
      const code = $c
        .ifFunction(
          $c.booleanFunction(true).run(),
          $c.stringFunction('hello').run(),
          $c.stringFunction('world').run(),
        )
        .run();

      expect(generateAndExecute(code)).to.equal('hello');
    });

    it('Handle unknown function', () => {
      const code = [[
        'unknownFunction',
        'test',
      ]]
      expect(() => new ChibiConsumer(code).run()).to.throw(UnknownChibiFunctionError);
    })
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);

  return new ChibiConsumer(script).run();
}
