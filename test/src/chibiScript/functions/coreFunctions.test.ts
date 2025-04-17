import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';
import { chibiRegistrySingleton } from '../../../../src/chibiScript/ChibiRegistry';

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

    it('should throw an error when trying to set a reserved key', () => {
      const code = $c.string('hello').setVariable('url').run();
      const consumer = generateAndExecute(code);

      expect(() => consumer.run()).to.throw('Cannot set reserved key: url');
    });
  });

  describe('global variables', () => {
    beforeEach(() => {
      chibiRegistrySingleton.clear();
    });

    it('should persist global variables between executions', () => {
      const setCode = $c.string('hello global').setGlobalVariable('persistentKey').run();
      generateAndExecute(setCode).run();

      const getCode = $c.getGlobalVariable('persistentKey', 'default').run();
      const result = generateAndExecute(getCode).run();

      expect(result).to.equal('hello global');
    });

    it('should throw an error when trying to set a reserved global key', () => {
      const code = $c.string('hello').setGlobalVariable('url').run();
      const consumer = generateAndExecute(code);

      expect(() => consumer.run()).to.throw('Cannot set reserved global key: url');
    });

    it('Normal set should not be persistent', () => {
      const setCode = $c.string('hello global').setVariable('persistentKey').run();
      generateAndExecute(setCode).run();

      const getCode = $c.getVariable('persistentKey', 'default').run();
      const result = generateAndExecute(getCode).run();

      expect(result).to.equal('default');
    });
  });

  describe('function', () => {
    it('should execute function body and return its result', () => {
      const code = $c.fn($c.string('hello').run()).run();
      expect(generateAndExecute(code).run()).to.equal('hello');
    });

    it('should capture return values from inside the function', () => {
      const code = $c.fn($c.string('hello').return().string('world').run()).run();
      expect(generateAndExecute(code).run()).to.equal('hello');
    });

    it('should allow function chaining after returned value', () => {
      const code = $c.fn($c.string('hello').return().run()).concat(' world').run();
      expect(generateAndExecute(code).run()).to.equal('hello world');
    });

    it('should handle nested functions and return values', () => {
      const code = $c.fn(
        $c.fn($c.string('inner').return().run()).concat(' function').return().run()
      ).concat(' outer').run();
      expect(generateAndExecute(code).run()).to.equal('inner function outer');
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);

  return consumer;
}
