import { expect } from 'chai';
import { $c } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';
import controlFlowFunctions from '../../../../src/chibiScript/functions/controlFlowFunctions';

describe('Control Flow Functions', () => {
  describe('then function', () => {
    it('should execute thenAction when input is truthy', () => {
      const code = $c
        .string('test')
        .ifThen($c => $c.string('executed').run())
        .run();
      expect(generateAndExecute(code).run()).to.equal('executed');

      const numberCode = $c
        .number(42)
        .ifThen($c => $c.string('executed').run())
        .run();
      expect(generateAndExecute(numberCode).run()).to.equal('executed');
    });

    it('should not execute thenAction when input is falsy', () => {
      const falseCode = $c
        .boolean(false)
        .ifThen($c => $c.string('executed').run())
        .run();
      expect(generateAndExecute(falseCode).run()).to.equal(false);

      const emptyStringCode = $c
        .string('')
        .ifThen($c => $c.string('executed').run())
        .run();
      expect(generateAndExecute(emptyStringCode).run()).to.equal('');

      const zeroCode = $c
        .number(0)
        .ifThen($c => $c.string('executed').run())
        .run();
      expect(generateAndExecute(zeroCode).run()).to.equal(0);
    });

    it('should pass the input to the thenAction', () => {
      const code = $c
        .string('input-value')
        .ifThen($c => $c.concat('-modified').run())
        .run();
      expect(generateAndExecute(code).run()).to.equal('input-value-modified');
    });

    it('should support chaining multiple then functions', () => {
      const code = $c
        .string('start')
        .ifThen($c => $c.concat('-1').run())
        .ifThen($c => $c.concat('-2').run())
        .ifThen($c => $c.concat('-3').run())
        .run();

      expect(generateAndExecute(code).run()).to.equal('start-1-2-3');
    });

    it('should not continue chain after a falsy value', () => {
      const code = $c
        .string('start')
        .ifThen($c => $c.boolean(false).run())
        .ifThen($c => $c.string('should-not-execute').run())
        .run();

      expect(generateAndExecute(code).run()).to.equal(false);
    });
  });

  describe('ifNotReturn function', () => {
    it('should return input when input is truthy', () => {
      const code = $c
        .string('test')
        .ifNotReturn($c.string('fallback').run())
        .run();
      expect(generateAndExecute(code).run()).to.equal('test');

      const numberCode = $c
        .number(42)
        .ifNotReturn($c.string('fallback').run())
        .run();
      expect(generateAndExecute(numberCode).run()).to.equal(42);
    });

    it('should return fallback when input is falsy', () => {
      const falseCode = $c
        .boolean(false)
        .ifNotReturn($c.string('fallback').run())
        .run();
      expect(generateAndExecute(falseCode).run()).to.equal('fallback');

      const emptyStringCode = $c
        .string('')
        .ifNotReturn($c.string('fallback').run())
        .run();
      expect(generateAndExecute(emptyStringCode).run()).to.equal('fallback');
    });

    it('should support chaining after successful check', () => {
      const code = $c
        .string('test')
        .ifNotReturn($c.string('fallback').run())
        .concat('-success')
        .run();
      expect(generateAndExecute(code).run()).to.equal('test-success');
    });

    it('should return null by default when no fallback is provided', () => {
      const code = $c
        .boolean(false)
        .ifNotReturn()
        .run();
      expect(generateAndExecute(code).run()).to.be.null;
    });
  });
});

function generateAndExecute(input: any) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);
  return consumer;
}
