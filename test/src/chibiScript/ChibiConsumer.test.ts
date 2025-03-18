import { expect } from 'chai';
import { $c, ChibiJson } from '../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../src/chibiScript/ChibiConsumer';
import { UnknownChibiFunctionError } from '../../../src/chibiScript/ChibiErrors';
import functionsRegistry from '../../../src/chibiScript/functions';

describe('ChibiConsumer', () => {
  describe('function chaining', () => {
    it('should allow chaining string functions', () => {
      const code = $c.string('test').run();
      expect(generateAndExecute(code).run()).to.equal('test');
    });

    it('should chain multiple functions correctly', () => {
      const code = $c
        .string('hello')
        .regex('e.', 0)
        .run();

      expect(generateAndExecute(code).run()).to.equal('el');
    });

    it('should chain ifFunction correctly', () => {
      const code = $c
        .if(
          $c.boolean(true).run(),
          $c.string('hello').run(),
          $c.string('world').run(),
        )
        .run();

      expect(generateAndExecute(code).run()).to.equal('hello');
    });

    it('Handle unknown function', () => {
      const code = [[
        'unknownFunction',
        'test',
      ]]
      expect(() => new ChibiConsumer(code).run()).to.throw(UnknownChibiFunctionError);
    })
  });

  describe('context', () => {
    it('should add and retrieve variables', () => {
      const code = $c.url().run();
      const consumer = new ChibiConsumer(code);
      consumer.addVariable('url', 'hello');

      expect(consumer.run()).to.equal('hello');
    });

    it('should throw error when run is called multiple times', () => {
      const code = $c.string('test').run();
      const consumer = new ChibiConsumer(code);

      expect(consumer.run()).to.equal('test');

      expect(() => consumer.run()).to.throw();
    });
  });
});

describe('ChibiConsumer Async', () => {
  describe('async function execution', () => {
    it('should execute async code and resolve promises', async () => {
      const code = $c.waitUntilTrue($c.boolean(true).run()).string('test').run();
      const consumer = new ChibiConsumer(code);

      const result = await consumer.runAsync();
      expect(result).to.equal('test');
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);

  return consumer;
}
