import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('Async Functions', () => {
  describe('waitUntilTrue', () => {
    it('should resolve immediately when condition is true', async () => {
      const code = $c.waitUntilTrue($c.boolean(true).run()).string('completed').run();
      const consumer = generateAndExecute(code);

      const result = await consumer.runAsync();
      expect(result).to.equal('completed');
    });

    it('should wait until condition becomes true', async () => {
      const code = $c.waitUntilTrue($c.getVariable('ready', false).run()).string('completed').run();
      const consumer = generateAndExecute(code);

      consumer.addVariable('ready', false);
      const resultPromise = consumer.runAsync();

      setTimeout(() => {
        consumer.addVariable('ready', true);
      }, 50);

      const result = await resultPromise;
      expect(result).to.equal('completed');
    }).timeout(1000);

    it('should work with nested function calls', async () => {
      const code = $c
        .if(
          $c.boolean(true).run(),
          $c.waitUntilTrue($c.getVariable('ready', false).run()).string('completed').run(),
          $c.string('not executed').run()
        )
        .run();

      const consumer = generateAndExecute(code);
      consumer.addVariable('ready', false);
      const resultPromise = consumer.runAsync();

      setTimeout(() => {
        consumer.addVariable('ready', true);
      }, 50);

      const result = await resultPromise;
      expect(result).to.equal('completed');
    }).timeout(1000);

    it('should handle multiple waitUntilTrue in sequence', async () => {
      const code = $c.waitUntilTrue($c.getVariable('step1', false).run())
        .waitUntilTrue($c.getVariable('step2', false).run())
        .string('both conditions met')
        .run();

      const consumer = generateAndExecute(code);
      consumer.addVariable('step1', false);
      consumer.addVariable('step2', false);

      const resultPromise = consumer.runAsync();

      setTimeout(() => {
        consumer.addVariable('step1', true);
      }, 20);

      setTimeout(() => {
        consumer.addVariable('step2', true);
      }, 50);

      const result = await resultPromise;
      expect(result).to.equal('both conditions met');
    }).timeout(1000);
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);

  return consumer;
}
