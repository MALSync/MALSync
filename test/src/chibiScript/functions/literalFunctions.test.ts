import { expect } from 'chai';
import { $c } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('Literal Functions', () => {
  describe('string', () => {
    it('should convert input to string', () => {
      const code = $c.number(42).string().run();
      expect(generateAndExecute(code).run()).to.equal('42');
    });

    it('should return static string value', () => {
      const code = $c.string('test').run();
      expect(generateAndExecute(code).run()).to.equal('test');
    });
  });

  describe('boolean', () => {
    it('should convert input to boolean', () => {
      const code = $c.string('').boolean().run();
      expect(generateAndExecute(code).run()).to.equal(false);

      const code2 = $c.string('test').boolean().run();
      expect(generateAndExecute(code2).run()).to.equal(true);
    });

    it('should return static boolean value', () => {
      const code = $c.boolean(true).run();
      expect(generateAndExecute(code).run()).to.equal(true);
    });
  });

  describe('number', () => {
    it('should convert input to number', () => {
      const code = $c.string('42').number().run();
      expect(generateAndExecute(code).run()).to.equal(42);
    });

    it('should return static number value', () => {
      const code = $c.number(42).run();
      expect(generateAndExecute(code).run()).to.equal(42);
    });
  });

  describe('array', () => {
    it('should return the provided array', () => {
      const code = $c.array(['1', '2', '3']).run();
      expect(generateAndExecute(code).run()).to.deep.equal(['1', '2', '3']);
    });

    it('should return empty array', () => {
      const code = $c.array([]).run();
      expect(generateAndExecute(code).run()).to.deep.equal([]);
    });
  });

  describe('object', () => {
    it('should return the provided object', () => {
      const code = $c.object({ key: 'value' }).run();
      expect(generateAndExecute(code).run()).to.deep.equal({ key: 'value' });
    });

    it('should return empty object', () => {
      const code = $c.object({}).run();
      expect(generateAndExecute(code).run()).to.deep.equal({});
    });
  });
});

function generateAndExecute(input: any) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);
  return consumer;
}
