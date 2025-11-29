import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('Number Functions', () => {
  describe('calculate function', () => {
    it('should perform addition', () => {
      const code = $c
        .number(5)
        .calculate('+', 3)
        .run();
      expect(generateAndExecute(code).run()).to.equal(8);
    });
    it('should perform subtraction with Chibi Parameter', () => {
      const code = $c
        .number(10)
        .calculate('-', $c.string('4').number().run())
        .run();
      expect(generateAndExecute(code).run()).to.equal(6);
    });
    it('should perform multiplication', () => {
      const code = $c
        .number(7)
        .calculate('*', 6)
        .run();
      expect(generateAndExecute(code).run()).to.equal(42);
    });
    it('should perform division', () => {
      const code = $c
        .number(20)
        .calculate('/', $c.string('4').number().run())
        .run();
      expect(generateAndExecute(code).run()).to.equal(5);
    });
    it('should throw error on division by zero', () => {
      const code = $c
        .number(10)
        .calculate('/', 0)
        .run();
      expect(generateAndExecute(code).run()).to.be.null;
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);
  return consumer;
}
