import { expect } from 'chai';
import { $c, ChibiJson } from '../../../../src/chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../../../../src/chibiScript/ChibiConsumer';

describe('String Functions', () => {
  describe('split', () => {
    it('should split string by delimiter', () => {
      const code = $c.string('a,b,c').split(',').run();
      expect(generateAndExecute(code).run()).to.deep.equal(['a', 'b', 'c']);
    });

    it('should handle empty string', () => {
      const code = $c.string('').split(',').run();
      expect(generateAndExecute(code).run()).to.deep.equal(['']);
    });
  });

  describe('join', () => {
    it('should join array with separator', () => {
      const code = $c.array(['a', 'b', 'c']).join('-').run();
      expect(generateAndExecute(code).run()).to.equal('a-b-c');
    });
  });

  describe('replace', () => {
    it('should replace first occurrence in string', () => {
      const code = $c.string('apple apple').replace('apple', 'orange').run();
      expect(generateAndExecute(code).run()).to.equal('orange apple');
    });

    it('should handle no matches', () => {
      const code = $c.string('apple').replace('banana', 'orange').run();
      expect(generateAndExecute(code).run()).to.equal('apple');
    });

    it('should handle ChibiJson as replacement', () => {
      const code = $c.string('apple apple').replace('apple', $c.string('orange').run()).run();
      expect(generateAndExecute(code).run()).to.equal('orange apple');
    });

    it('should handle complex ChibiJson as replacement', () => {
      const code = $c
        .string('apple apple')
        .replace('apple', $c.string('fruit').toUpperCase().run())
        .run();
      expect(generateAndExecute(code).run()).to.equal('FRUIT apple');
    });
  });

  describe('replaceAll', () => {
    it('should replace all occurrences in string', () => {
      const code = $c.string('apple apple').replaceAll('apple', 'orange').run();
      expect(generateAndExecute(code).run()).to.equal('orange orange');
    });

    it('should handle ChibiJson as replacement', () => {
      const code = $c.string('apple apple').replaceAll('apple', $c.string('orange').run()).run();
      expect(generateAndExecute(code).run()).to.equal('orange orange');
    });

    it('should handle complex ChibiJson as replacement', () => {
      const code = $c
        .string('apple apple')
        .replaceAll('apple', $c.string('fruit').toUpperCase().run())
        .run();
      expect(generateAndExecute(code).run()).to.equal('FRUIT FRUIT');
    });
  });

  describe('replaceRegex', () => {
    it('should replace using regex pattern', () => {
      const code = $c.string('hello123world').replaceRegex('\\d+', '!').run();
      expect(generateAndExecute(code).run()).to.equal('hello!world');
    });

    it('should be case-insensitive by default', () => {
      const code = $c.string('HELLO123').replaceRegex('hello', 'hi').run();
      expect(generateAndExecute(code).run()).to.equal('hi123');
    });

    it('should respect provided flags', () => {
      const code = $c.string('HELLO123').replaceRegex('hello', 'hi', '').run();
      expect(generateAndExecute(code).run()).to.equal('HELLO123');
    });

    it('should handle ChibiJson as replacement', () => {
      const code = $c.string('hello123').replaceRegex('\\d+', $c.string('!').run()).run();
      expect(generateAndExecute(code).run()).to.equal('hello!');
    });
  });

  describe('substring', () => {
    it('should extract substring with start and end indexes', () => {
      const code = $c.string('hello world').substring(0, 5).run();
      expect(generateAndExecute(code).run()).to.equal('hello');
    });

    it('should extract substring with only start index', () => {
      const code = $c.string('hello world').substring(6).run();
      expect(generateAndExecute(code).run()).to.equal('world');
    });
  });

  describe('regex', () => {
    it('should extract matched group', () => {
      const code = $c.string('hello123world').regex('o(\\d+)', 0).run();
      expect(generateAndExecute(code).run()).to.equal('o123');
    });

    it('should extract capture group', () => {
      const code = $c.string('hello123world').regex('o(\\d+)', 1).run();
      expect(generateAndExecute(code).run()).to.equal('123');
    });

    it('should throw error for no match', () => {
      const code = $c.string('helloworld').regex('\\d+', 0).run();
      expect(generateAndExecute(code).run()).to.equal(null);
    });

    it('should be case-insensitive by default', () => {
      const code = $c.string('HELLO123').regex('hello(\\d+)', 1).run();
      expect(generateAndExecute(code).run()).to.equal('123');
    });

    it('should respect provided flags', () => {
      const code = $c.string('HELLO123').regex('hello(\\d+)', 1, '').run();
      expect(generateAndExecute(code).run()).to.equal(null);
    });

    it('should use multiple flags', () => {
      const code = $c.string('HELLO\n123').regex('hello(.*)', 1, 'is').run();
      expect(generateAndExecute(code).run()).to.equal('\n123');
    });
  });

  describe('toLowerCase', () => {
    it('should convert to lowercase', () => {
      const code = $c.string('Hello World').toLowerCase().run();
      expect(generateAndExecute(code).run()).to.equal('hello world');
    });
  });

  describe('toUpperCase', () => {
    it('should convert to uppercase', () => {
      const code = $c.string('Hello World').toUpperCase().run();
      expect(generateAndExecute(code).run()).to.equal('HELLO WORLD');
    });
  });

  describe('trim', () => {
    it('should trim whitespace', () => {
      const code = $c.string('  hello  ').trim().run();
      expect(generateAndExecute(code).run()).to.equal('hello');
    });
  });

  describe('includes', () => {
    it('should return true when string includes substring', () => {
      const code = $c.string('hello world').includes('world').run();
      expect(generateAndExecute(code).run()).to.be.true;
    });

    it('should return false when string does not include substring', () => {
      const code = $c.string('hello world').includes('banana').run();
      expect(generateAndExecute(code).run()).to.be.false;
    });
  });

  describe('concat', () => {
    it('should concatenate two strings', () => {
      const code = $c.string('Hello').concat(' World').run();
      expect(generateAndExecute(code).run()).to.equal('Hello World');
    });

    it('should handle ChibiJson as second string', () => {
      const code = $c.string('Hello').concat($c.string(' World').run()).run();
      expect(generateAndExecute(code).run()).to.equal('Hello World');
    });
  });

  describe('jsonParse', () => {
    it('should parse simple JSON string', () => {
      const code = $c.string('{"key":"value"}').jsonParse().run();
      expect(generateAndExecute(code).run()).to.deep.equal({ key: 'value' });
    });

    it('should parse array JSON string', () => {
      const code = $c.string('[1,2,3]').jsonParse().run();
      expect(generateAndExecute(code).run()).to.deep.equal([1, 2, 3]);
    });

    it('should parse nested JSON objects', () => {
      const code = $c.string('{"outer":{"inner":"value"}}').jsonParse().run();
      expect(generateAndExecute(code).run()).to.deep.equal({ outer: { inner: 'value' } });
    });

    it('should throw error for invalid JSON', () => {
      const code = $c.string('{invalid}').jsonParse().run();
      expect(generateAndExecute(code).run()).to.be.null;
    });
  });

  describe('toHalfWidth', () => {
    it('should converts full-width ASCII characters or number to its half-width character', () => {
      const code = $c.string('Ｈelｌｏ　Ｗoｒlｄ　３').toHalfWidth().run();
      expect(generateAndExecute(code).run()).to.equal('Hello World 3');
    });

    it('should only converts full-width ASCII characters or number to its half-width character', () => {
      const code = $c.string('こんにちは　ワールド　３ｓ').toHalfWidth().run();
      expect(generateAndExecute(code).run()).to.equal('こんにちは ワールド 3s');
    });
  });

  describe('JPtoNumeral', () => {
    it('should converts Japanese ten numeral to standard Arabic numeral', () => {
      const code = $c.string('九十八').JPtoNumeral().run();
      expect(generateAndExecute(code).run()).to.equal(98);
    });

    it('should converts Japanese hundred numeral to standard Arabic numeral', () => {
      const code = $c.string('二百三').JPtoNumeral().run();
      expect(generateAndExecute(code).run()).to.equal(203);
    });

    it('should converts Japanese thousand to standard Arabic numeral', () => {
      const code = $c.string('二千八百七十一').JPtoNumeral().run();
      expect(generateAndExecute(code).run()).to.equal(2871);
    });

    it('should converts Japanese ten thousand numeral to standard Arabic numeral', () => {
      const code = $c.string('一万二千三百四十五').JPtoNumeral().run();
      expect(generateAndExecute(code).run()).to.equal(12345);
    });

    it('should throw error for no match', () => {
      const code = $c.string('第五十四話').JPtoNumeral().run();
      expect(generateAndExecute(code).run()).to.equal(null);
    });
  });
});

function generateAndExecute(input: ChibiJson<any>) {
  const json = JSON.stringify(input);
  const script = JSON.parse(json);
  const consumer = new ChibiConsumer(script);

  return consumer;
}
