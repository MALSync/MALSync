import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('Core Functions', () => {
  describe('url', () => {
    it('should return URL from context if available', () => {
      const code = $c.url().run();
      const consumer = generateAndExecute(code);
      consumer.addVariable('url', 'https://example.com');

      expect(consumer.run()).to.equal('https://example.com');
    });
  });

  describe('return', () => {
    it('should return the input value', () => {
      const code = $c.string('hello').return().string('world').run();
      expect(generateAndExecute(code).run()).to.equal('hello');
    });
    // check inside of if
    it('should return the input value inside of if', () => {
      const code = $c.if(
        $c.boolean(true).run(),
        $c.string('hello').return().string('world').run(),
        $c.string('world').run()
      ).string('world').run();
      expect(generateAndExecute(code).run()).to.equal('hello');
    });
  });

  describe('getVariable', () => {
    it('should get a value from context', () => {
      const code = $c.getVariable('myKey', 'default').run();
      const consumer = generateAndExecute(code);
      consumer.addVariable('myKey', 'stored value');

      expect(consumer.run()).to.equal('stored value');
    });

    it('should return default value if key not found', () => {
      const code = $c.getVariable('nonExistentKey', 'default').run();
      expect(generateAndExecute(code).run()).to.equal('default');
    });
  });

  describe('setVariable', () => {
    it('should set a value in context and return the input', () => {
      const code = $c.string('hello').setVariable('myKey').run();

      expect(generateAndExecute(code).run()).to.equal('hello');
    });

    it('should set a provided value instead of the input', () => {
      const code = $c.string('hello').setVariable('myKey', $c.string('world').run()).getVariable('myKey').run();

      expect(generateAndExecute(code).run()).to.equal('world');
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);

  return consumer;
}
