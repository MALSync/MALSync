import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('Condition Functions', () => {
  describe('equals', () => {
    it('should return true when values are strictly equal', () => {
      const code = $c.number(5).equals(5).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when values are different types', () => {
      const code = $c.number(5).equals('5').run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return false when values are different', () => {
      const code = $c.string('hello').equals('world').run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('greaterThan', () => {
    it('should return true when input is greater than value', () => {
      const code = $c.number(10).greaterThan(5).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when input is equal to value', () => {
      const code = $c.number(5).greaterThan(5).run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return false when input is less than value', () => {
      const code = $c.number(3).greaterThan(5).run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('greaterThanOrEqual', () => {
    it('should return true when input is greater than value', () => {
      const code = $c.number(10).greaterThanOrEqual(5).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return true when input is equal to value', () => {
      const code = $c.number(5).greaterThanOrEqual(5).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when input is less than value', () => {
      const code = $c.number(3).greaterThanOrEqual(5).run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('lessThan', () => {
    it('should return false when input is greater than value', () => {
      const code = $c.number(10).lessThan(5).run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return false when input is equal to value', () => {
      const code = $c.number(5).lessThan(5).run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return true when input is less than value', () => {
      const code = $c.number(3).lessThan(5).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });
  });

  describe('lessThanOrEqual', () => {
    it('should return false when input is greater than value', () => {
      const code = $c.number(10).lessThanOrEqual(5).run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return true when input is equal to value', () => {
      const code = $c.number(5).lessThanOrEqual(5).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return true when input is less than value', () => {
      const code = $c.number(3).lessThanOrEqual(5).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });
  });

  describe('contains', () => {
    it('should return true when string contains substring', () => {
      const code = $c.string('hello world').contains('world').run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when string does not contain substring', () => {
      const code = $c.string('hello world').contains('banana').run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should be case sensitive', () => {
      const code = $c.string('hello World').contains('world').run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('matches', () => {
    it('should return true when string matches regex pattern', () => {
      const code = $c.string('abc123').matches('^[a-z]+\\d+$').run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when string does not match regex pattern', () => {
      const code = $c.string('abc123').matches('^\\d+$').run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should be case-insensitive by default', () => {
      const code = $c.string('ABC123').matches('^[a-z]+\\d+$').run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should respect provided flags', () => {
      const code = $c.string('ABC123').matches('^[a-z]+\\d+$', '').run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('and', () => {
    it('should return true when all values are true', () => {
      const code = $c.and($c.boolean(true).run(), $c.boolean(true).run(), $c.boolean(true).run()).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when any value is false', () => {
      const code = $c.and($c.boolean(true).run(), $c.boolean(false).run(), $c.boolean(true).run()).run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return true with no arguments', () => {
      const code = $c.and().run();
      expect(generateAndExecute(code).run()).to.be.true;
    });
  });

  describe('or', () => {
    it('should return true when any value is true', () => {
      const code = $c.or($c.boolean(false).run(), $c.boolean(true).run(), $c.boolean(false).run()).run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when all values are false', () => {
      const code = $c.or($c.boolean(false).run(), $c.boolean(false).run(), $c.boolean(false).run()).run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return false with no arguments', () => {
      const code = $c.or().run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('not', () => {
    it('should negate true to false', () => {
      const code = $c.boolean(true).not().run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should negate false to true', () => {
      const code = $c.boolean(false).not().run();
      expect(generateAndExecute(code).run()).to.be.true;
    });
  });

  describe('isNil', () => {
    it('should return false for empty string', () => {
      const code = $c.string('').isNil().run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return false for 0', () => {
      const code = $c.number(0).isNil().run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty string', () => {
      const code = $c.string('').isEmpty().run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false for non-empty string', () => {
      const code = $c.string('hello').isEmpty().run();
      expect(generateAndExecute(code).run()).to.be.false;
    });

    it('should return true for empty array', () => {
      const code = $c.array([]).isEmpty().run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false for non-empty array', () => {
      const code = $c.array(["1", "2", "3"]).isEmpty().run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('coalesce', () => {
    it('should return first non-nil value', () => {
      const code = $c.coalesce(
        //@ts-ignore
        $c.string(null).run(),
        $c.string(undefined).run(),
        $c.string('test').run(),
        $c.string('ignored').run()
      ).run();
      expect(generateAndExecute(code).run()).to.equal('test');
    });

    it('should return undefined when all values are nil', () => {
      const code = $c
        .coalesce(
          //@ts-ignore
          $c.string(null).run(),
          $c.string(undefined).run(),
        )
        .run();
      expect(generateAndExecute(code).run()).to.be.undefined;
    });

    it('should handle empty arguments', () => {
      const code = $c.coalesce().run();
      expect(generateAndExecute(code).run()).to.be.undefined;
    });

    it('should return zero if it is a valid value', () => {
      const code = $c
        .coalesce(
          //@ts-ignore
          $c.string(null).run(),
          $c.number(0).run(),
          $c.string('test').run(),
        )
        .run();
      expect(generateAndExecute(code).run()).to.equal(0);
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);

  return consumer;
}
