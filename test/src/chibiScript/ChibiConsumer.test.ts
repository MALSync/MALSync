import { expect } from 'chai';
import { $c, ChibiJson } from '../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../src/chibiScript/ChibiConsumer';
import { UnknownChibiFunctionError } from '../../../src/chibiScript/ChibiErrors';

describe('ChibiConsumer', () => {
  describe('function chaining', () => {
    it('should allow chaining string functions', () => {
      const code = $c.string('test').run();
      expect(generateAndExecute(code)).to.equal('test');
    });

    it('should chain multiple functions correctly', () => {
      const code = $c
        .string('hello')
        .regexFunction('e.', 0)
        .run();

      expect(generateAndExecute(code)).to.equal('el');
    });

    it('should chain ifFunction correctly', () => {
      const code = $c
        .ifFunction(
          $c.boolean(true).run(),
          $c.string('hello').run(),
          $c.string('world').run(),
        )
        .run();

      expect(generateAndExecute(code)).to.equal('hello');
    });

    it('Handle unknown function', () => {
      const code = [[
        'unknownFunction',
        'test',
      ]]
      expect(() => new ChibiConsumer().run(code)).to.throw(UnknownChibiFunctionError);
    })
  });

  describe('context', () => {
    it('should add and retrieve variables', () => {
      const code = $c.urlFunction().run();
      const consumer = new ChibiConsumer();
      consumer.addVariable('url', 'hello');

      expect(consumer.run(code)).to.equal('hello');
    });
  });
});

function generateAndExecute(input: ChibiJson<any>, consumer: ChibiConsumer = new ChibiConsumer()) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);

  return consumer.run(script);
}
