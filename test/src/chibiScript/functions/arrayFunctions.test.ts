import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('Array Functions', () => {
  describe('first', () => {
    it('should return the first element of the array', () => {
      const code = $c.array(['1', '2', '3']).first().run();
      expect(generateAndExecute(code).run()).to.equal('1');
    });

    it('should return undefined for empty array', () => {
      const code = $c.array([]).first().run();
      expect(generateAndExecute(code).run()).to.be.undefined;
    });
  });

  describe('last', () => {
    it('should return the last element of the array', () => {
      const code = $c.array(["1", "2", "3"]).last().run();
      expect(generateAndExecute(code).run()).to.equal("3");
    });

    it('should return undefined for empty array', () => {
      const code = $c.array([]).last().run();
      expect(generateAndExecute(code).run()).to.be.undefined;
    });
  });

  describe('at', () => {
    it('should return element at specified index', () => {
      const code = $c.array(['1', '2', '3']).at(1).run();
      expect(generateAndExecute(code).run()).to.equal("2");
    });

    it('should return undefined for out of bounds index', () => {
      const code = $c.array(['1', '2', '3']).at(10).run();
      expect(generateAndExecute(code).run()).to.be.undefined;
    });
  });

  describe('length', () => {
    it('should return the number of elements in the array', () => {
      const code = $c.array(['1', '2', '3']).length().run();
      expect(generateAndExecute(code).run()).to.equal(3);
    });

    it('should return 0 for empty array', () => {
      const code = $c.array([]).length().run();
      expect(generateAndExecute(code).run()).to.equal(0);
    });
  });

  describe('slice', () => {
    it('should extract elements from start to end', () => {
      const code = $c.array(['1', '2', '3', '4', '5']).slice(1, 3).run();
      expect(generateAndExecute(code).run()).to.deep.equal(['2', '3']);
    });

    it('should extract elements from start to end of array when end not specified', () => {
      const code = $c.array(['1', '2', '3', '4', '5']).slice(2).run();
      expect(generateAndExecute(code).run()).to.deep.equal(['3', '4', '5']);
    });
  });

  describe('reverse', () => {
    it('should reverse the order of elements in the array', () => {
      const code = $c.array(['1', '2', '3']).reverse().run();
      expect(generateAndExecute(code).run()).to.deep.equal(['3', '2', '1']);
    });

    it('should return an empty array when input is empty', () => {
      const code = $c.array([]).reverse().run();
      expect(generateAndExecute(code).run()).to.deep.equal([]);
    });
  });

  describe('includes', () => {
    it('should return true when element is in array', () => {
      const code = $c.array(['1', '2', '3']).arrayIncludes('2').run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when element is not in array', () => {
      const code = $c.array(['1', '2', '3']).arrayIncludes('4').run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('map', () => {
    it('should transform each element in the array', () => {
      const code = $c
        .array(['1', '2', '3'])
        .map($item => $item.concat('2').run())
        .run();
      expect(generateAndExecute(code).run()).to.deep.equal(['12', '22', '32']);
    });

    it('should handle empty array', () => {
      const code = $c
        .array([])
        .map($item => $item.concat('2').run())
        .run();
      expect(generateAndExecute(code).run()).to.deep.equal([]);
    });
  });

  describe('find', () => {
    it('should find element that satisfies condition', () => {
      const code = $c
        .array(['1', '2', '3', '4'])
        .arrayFind($item => $item.number().greaterThan(2).run())
        .run();
      expect(generateAndExecute(code).run()).to.equal('3');
    });

    it('should return undefined when no element satisfies condition', () => {
      const code = $c
        .array(['1', '2', '3'])
        .arrayFind($item => $item.number().greaterThan(5).run())
        .run();
      expect(generateAndExecute(code).run()).to.be.undefined;
    });
  });

  describe('filter', () => {
    it('should filter elements that satisfy condition', () => {
      const code = $c
        .array(['1', '2', '3', '4'])
        .filter($item => $item.number().greaterThan(2).run())
        .run();
      expect(generateAndExecute(code).run()).to.deep.equal(['3', '4']);
    });

    it('should return empty array when no elements satisfy condition', () => {
      const code = $c
        .array(['1', '2', '3'])
        .filter($item => $item.number().greaterThan(5).run())
        .run();
      expect(generateAndExecute(code).run()).to.deep.equal([]);
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);
  return consumer;
}
