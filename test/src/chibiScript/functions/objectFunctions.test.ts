import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('Object Functions', () => {
  describe('get', () => {
    it('should retrieve a property from an object by key', () => {
      const code = $c.string('{"name":"John","age":30}').jsonParse().get('name').run();
      expect(generateAndExecute(code).run()).to.equal('John');
    });

    it('should retrieve nested properties using chained calls', () => {
      const code = $c.string('{"user":{"profile":{"name":"John"}}}').jsonParse().get('user').get('profile').get('name').run();
      expect(generateAndExecute(code).run()).to.equal('John');
    });

    it('should return undefined for non-existent properties', () => {
      const code = $c.string('{"name":"John"}').jsonParse().get('address').run();
      expect(generateAndExecute(code).run()).to.be.undefined;
    });

    it('should handle array access', () => {
      const code = $c.string('{"users":["John","Jane","Bob"]}').jsonParse().get('users').at(1).run();
      expect(generateAndExecute(code).run()).to.equal('Jane');
    });
  });

  describe('keys', () => {
    it('should return all keys of an object', () => {
      const code = $c.string('{"name":"John","age":30}').jsonParse().keys().run();
      expect(generateAndExecute(code).run()).to.deep.equal(['name', 'age']);
    });

    it('should return empty array for non-object inputs', () => {
      const code = $c.string('123').jsonParse().keys().run();
      expect(generateAndExecute(code).run()).to.deep.equal([]);
    });

    it('should return array indices for arrays', () => {
      const code = $c.string('["a","b","c"]').jsonParse().keys().run();
      expect(generateAndExecute(code).run()).to.deep.equal(['0', '1', '2']);
    });
  });

  describe('values', () => {
    it('should return all values of an object', () => {
      const code = $c.string('{"name":"John","age":30}').jsonParse().values().run();
      expect(generateAndExecute(code).run()).to.deep.equal(['John', 30]);
    });

    it('should return empty array for non-object inputs', () => {
      const code = $c.string('123').jsonParse().values().run();
      expect(generateAndExecute(code).run()).to.deep.equal([]);
    });

    it('should return array elements for arrays', () => {
      const code = $c.string('["a","b","c"]').jsonParse().values().run();
      expect(generateAndExecute(code).run()).to.deep.equal(['a', 'b', 'c']);
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);
  return consumer;
}
