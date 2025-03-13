import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('Core Functions', () => {
  describe('url', () => {
    it('should return URL from context if available', () => {
      const consumer = new ChibiConsumer();
      consumer.addVariable('url', 'https://example.com');
      const code = $c.url().run();

      expect(generateAndExecute(code, consumer)).to.equal('https://example.com');
    });
  });

  describe('return', () => {
    it('should return the input value', () => {
      const code = $c.string('hello').return().string('world').run();
      expect(generateAndExecute(code)).to.equal('hello');
    });
  });

  describe('getVariable', () => {
    it('should get a value from context', () => {
      const code = $c.getVariable('myKey', 'default').run();
      const consumer = new ChibiConsumer();
      consumer.addVariable('myKey', 'stored value');

      expect(generateAndExecute(code, consumer)).to.equal('stored value');
    });

    it('should return default value if key not found', () => {
      const code = $c.getVariable('nonExistentKey', 'default').run();
      expect(generateAndExecute(code)).to.equal('default');
    });
  });

  describe('setVariable', () => {
    it('should set a value in context and return the input', () => {
      const code = $c.string('hello').setVariable('myKey').run();

      expect(generateAndExecute(code)).to.equal('hello');
    });

    it('should set a provided value instead of the input', () => {
      const code = $c.string('hello').setVariable('myKey', $c.string('world').run()).getVariable('myKey').run();

      expect(generateAndExecute(code)).to.equal('world');
    });
  });
});

function generateAndExecute(input: ChibiJson<any>, consumer: ChibiConsumer = new ChibiConsumer()) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);

  return consumer.run(script);
}
