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

    it('should throw error if called in sync context', () => {
      const code = $c.waitUntilTrue($c.boolean(true).run()).string('completed').run();
      const consumer = generateAndExecute(code);

      expect(() => consumer.run()).to.throw('Async functions are not supported in this context');
    });

    describe('nested function calls', () => {
      it('waitUntilTrue', async () => {
        const code = $c
          .waitUntilTrue($c.waitUntilTrue($c.getVariable('ready', false).run()).boolean(true).run())
          .string('completed')
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

      it('if', async () => {
        const code = $c
          .if(
            $c.boolean(true).run(),
            $c.waitUntilTrue($c.getVariable('ready', false).run()).string('completed').run(),
            $c.string('not executed').run(),
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

      it('ifThen', async () => {
        const code = $c
          .boolean(true)
          .ifThen($c =>
            $c.waitUntilTrue($c.getVariable('ready', false).run()).string('completed').run(),
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

      it('ifNotReturn', async () => {
        const code = $c
          .boolean(false)
          .ifNotReturn(
            $c.waitUntilTrue($c.getVariable('ready', false).run()).string('completed').run(),
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

      it('map', async () => {
        const code = $c
          .array(['1', '2', '3'])
          .map($item =>
            $item.waitUntilTrue($c.getVariable('ready', false).run()).string('complete').run(),
          )
          .run();

        const consumer = generateAndExecute(code);
        consumer.addVariable('ready', false);
        const resultPromise = consumer.runAsync();

        setTimeout(() => {
          consumer.addVariable('ready', true);
        }, 50);

        const result = await resultPromise;
        expect(result).deep.equal(['complete', 'complete', 'complete']);
      }).timeout(1000);

      it('arrayFind', async () => {
        const code = $c
          .array(['1', '2', '3'])
          .arrayFind($item =>
            $item.waitUntilTrue($c.getVariable('ready', false).run()).boolean(true).run(),
          )
          .run();

        const consumer = generateAndExecute(code);
        consumer.addVariable('ready', false);
        const resultPromise = consumer.runAsync();

        setTimeout(() => {
          consumer.addVariable('ready', true);
        }, 50);

        const result = await resultPromise;
        expect(result).to.equal('1');
      }).timeout(1000);

      it('filter', async () => {
        const code = $c
          .array(['1', '2', '3'])
          .filter($item =>
            $item.waitUntilTrue($c.getVariable('ready', false).run()).boolean(true).run(),
          )
          .run();

        const consumer = generateAndExecute(code);
        consumer.addVariable('ready', false);
        const resultPromise = consumer.runAsync();

        setTimeout(() => {
          consumer.addVariable('ready', true);
        }, 50);

        const result = await resultPromise;
        expect(result).deep.equal(['1', '2', '3']);
      }).timeout(1000);

      it('setVariable', async () => {
        const code = $c
          .setVariable(
            'result',
            $c.waitUntilTrue($c.getVariable('ready', false).run()).string('complete').run(),
          )
          .getVariable('result', 'not set')
          .run();

        const consumer = generateAndExecute(code);
        consumer.addVariable('ready', false);
        const resultPromise = consumer.runAsync();

        setTimeout(() => {
          consumer.addVariable('ready', true);
        }, 50);

        const result = await resultPromise;
        expect(result).to.equal('complete');
      }).timeout(1000);

      it('setGlobalVariable', async () => {
        const code = $c
          .setGlobalVariable(
            'result',
            $c.waitUntilTrue($c.getVariable('ready', false).run()).string('complete').run(),
          )
          .getGlobalVariable('result', 'not set')
          .run();

        const consumer = generateAndExecute(code);
        consumer.addVariable('ready', false);
        const resultPromise = consumer.runAsync();

        setTimeout(() => {
          consumer.addVariable('ready', true);
        }, 50);

        const result = await resultPromise;
        expect(result).to.equal('complete');
      }).timeout(1000);

      it('fn', async () => {
        const code = $c
          .fn(
            $c.waitUntilTrue($c.getVariable('ready', false).run()).string('Hello').return().run(),
          )
          .string()
          .concat(' world')
          .run();

        const consumer = generateAndExecute(code);
        consumer.addVariable('ready', false);
        const resultPromise = consumer.runAsync();

        setTimeout(() => {
          consumer.addVariable('ready', true);
        }, 50);

        const result = await resultPromise;
        expect(result).to.equal('Hello world');
      }).timeout(1000);

      it('and', async () => {
        const code = $c
          .and(
            $c.waitUntilTrue($c.getVariable('ready', false).run()).boolean(true).run(),
            $c.boolean(true).run(),
          )
          .ifThen($c => $c.string('Hello world').return().run())
          .run();

        const consumer = generateAndExecute(code);
        consumer.addVariable('ready', false);
        const resultPromise = consumer.runAsync();

        setTimeout(() => {
          consumer.addVariable('ready', true);
        }, 50);

        const result = await resultPromise;
        expect(result).to.equal('Hello world');
      }).timeout(1000);

      it('or', async () => {
        const code = $c
          .or(
            $c.waitUntilTrue($c.getVariable('ready', false).run()).boolean(true).run(),
            $c.boolean(false).run(),
          )
          .ifThen($c => $c.string('Hello world').return().run())
          .run();

        const consumer = generateAndExecute(code);
        consumer.addVariable('ready', false);
        const resultPromise = consumer.runAsync();

        setTimeout(() => {
          consumer.addVariable('ready', true);
        }, 50);

        const result = await resultPromise;
        expect(result).to.equal('Hello world');
      }).timeout(1000);

      it('coalesce', async () => {
        const code = $c
          .coalesce(
            $c.fn($c.waitUntilTrue($c.getVariable('ready', false).run()).boolean(false).ifNotReturn().run()).run(),
            $c.waitUntilTrue($c.getVariable('ready', false).run()).string('completed').run(),
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
    });

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

  it('wait function', async () => {
    const start = Date.now();
    const code = $c.string('done').wait(200).run();
    const consumer = generateAndExecute(code);

    const result = await consumer.runAsync();
    const duration = Date.now() - start;

    expect(result).to.equal('done');
    expect(duration).to.be.at.least(200);
  }).timeout(1000);

  it('detectChanges function', async () => {
    const code = $c
      .trigger()
      .detectChanges($c.getVariable('bar', 'base').run(), $c.trigger().run())
      .run();

    const consumer = generateAndExecute(code);

    let callCount = 0;
    consumer.addVariable('trigger', () => {
      callCount++;
    });

    consumer.runAsync();

    consumer.addVariable('bar', 'first');
    await new Promise(res => setTimeout(res, 50));
    consumer.addVariable('bar', 'second');
    await new Promise(res => setTimeout(res, 1500));

    expect(callCount).to.equal(2);
    consumer.clearIntervals();
  }).timeout(5000);

  it('debounce function', async () => {
    const code = $c
      .trigger()
      .detectChanges($c.getVariable('bar', 'base').run(), $c.debounce(1500).trigger().run())
      .run();

    const consumer = generateAndExecute(code);

    let callCount = 0;
    consumer.addVariable('trigger', () => {
      callCount++;
    });

    consumer.runAsync();

    consumer.addVariable('bar', 'first');
    await new Promise(res => setTimeout(res, 50));
    consumer.addVariable('bar', 'second');
    await new Promise(res => setTimeout(res, 1500));
    consumer.addVariable('bar', 'third');
    await new Promise(res => setTimeout(res, 1500));

    expect(callCount).to.equal(2);
    consumer.clearIntervals();
  }).timeout(5000);
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);

  return consumer;
}
