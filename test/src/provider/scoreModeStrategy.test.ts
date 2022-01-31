import { expect } from 'chai';
import { point100 } from '../../../src/_provider/ScoreMode/point100';
import { point10 } from '../../../src/_provider/ScoreMode/point10';
import { smiley3 } from '../../../src/_provider/ScoreMode/smiley3';
import { stars5 } from '../../../src/_provider/ScoreMode/stars5';
import { point100decimal } from '../../../src/_provider/ScoreMode/point100decimal';
import { point20decimal } from '../../../src/_provider/ScoreMode/point20decimal';
import { smiley4 } from '../../../src/_provider/ScoreMode/smiley4';
import { point10decimal } from '../../../src/_provider/ScoreMode/point10decimal';

describe('scoreModeStrategy', function() {
  const testArray = [
    {
      name: '10 points',
      class: point10,
      optionNumber: 11,
      valueToOptionValue: {
        1: 10,
        10: 10,
        '54': 50,
        55: 60,
        100: 100,
      },
      optionValueToValue: {
        1: 1,
        10: 10,
        '55': 55,
        100: 100,
      },
    },
    {
      name: '100 points',
      class: point100,
      optionNumber: 101,
      valueToOptionValue: {
        1: 1,
        10: 10,
        '54': 54,
        55: 55,
        100: 100,
      },
      optionValueToValue: {
        1: 1,
        10: 10,
        '54': 54,
        55: 55,
        100: 100,
      },
    },
    {
      name: '3 smilys',
      class: smiley3,
      optionNumber: 4,
      valueToOptionValue: {
        1: 35,
        10: 35,
        '54': 60,
        55: 60,
        100: 85,
      },
      optionValueToValue: {
        1: 1,
        10: 10,
        '54': 54,
        55: 55,
        100: 100,
      },
    },
    {
      name: '5 stars',
      class: stars5,
      optionNumber: 6,
      valueToOptionValue: {
        1: 10,
        10: 10,
        21: 30,
        '54': 50,
        55: 50,
        100: 90,
      },
      optionValueToValue: {
        1: 1,
        10: 10,
        '54': 54,
        55: 55,
        100: 100,
      },
    },
    {
      name: '100 points decimal',
      class: point100decimal,
      optionNumber: 101,
      valueToOptionValue: {
        1: 0.1,
        10: 1.0,
        '54': 5.4,
        55: 5.5,
        100: 10.0,
      },
      optionValueToValue: {
        0.1: 1,
        1.2: 12,
        '5.4': 54,
        5.5: 55,
        10.0: 100,
      },
    },
    {
      name: '20 points decimal',
      class: point20decimal,
      optionNumber: 20,
      valueToOptionValue: {
        1: 10,
        10: 10,
        14: 15,
        52: 50,
        '54': 55,
        55: 55,
        100: 100,
      },
      optionValueToValue: {
        1: 1,
        10: 10,
        '54': 54,
        55: 55,
        100: 100,
      },
    },
    {
      name: '4 smilys',
      class: smiley4,
      optionNumber: 5,
      valueToOptionValue: {
        1: 10,
        10: 10,
        '54': 40,
        55: 70,
        84: 70,
        85: 100,
        100: 100,
      },
      optionValueToValue: {
        1: 1,
        10: 10,
        '54': 54,
        55: 55,
        100: 100,
      },
    },
    {
      name: '10 points decimal',
      class: point10decimal,
      optionNumber: 11,
      valueToOptionValue: {
        1: 10,
        10: 10,
        '54': 50,
        55: 60,
        100: 100,
      },
      optionValueToValue: {
        1: 1,
        10: 10,
        '55': 55,
        100: 100,
      },
    },
  ];
  for (const test of testArray) {
    describe(`${test.name}`, function() {
      it(`should get ${test.optionNumber} options`, function() {
        expect(test.class.getOptions().length).to.equal(test.optionNumber);
      });

      it('0', function() {
        const option0 = test.class.getOptions().find(o => o.value === 0);
        expect(option0.value).to.equal(0);
        expect(test.class.valueToOptionValue(0)).to.equal(0);
        expect(test.class.valueToOptionValue(undefined)).to.equal(0);
        expect(test.class.valueToOptionValue(null)).to.equal(0);
        expect(test.class.optionValueToValue(0)).to.equal(0);
        expect(test.class.optionValueToValue(undefined)).to.equal(0);
        expect(test.class.optionValueToValue(null)).to.equal(0);
      })

      describe('valueToOptionValue', function() {
        for (const [value, optionValue] of Object.entries(test.valueToOptionValue)) {
          it(`${value}`, function() {
            const optionValueResult = test.class.valueToOptionValue(value);
            const optionValueResultNumber = test.class.valueToOptionValue(Number(value));
            expect(optionValueResultNumber).to.equal(optionValueResult);
            expect(optionValueResult).to.equal(optionValue);
            const optionFound = test.class.getOptions().find(o => o.value === optionValueResult);
            expect(optionFound.value).to.equal(optionValue);
          });
        }
      });

      describe('optionValueToValue', function() {
        for (const [optionValue, value] of Object.entries(test.optionValueToValue)) {
          it(`${optionValue}`, function() {
            const valueResult = test.class.optionValueToValue(optionValue);
            expect(valueResult).to.equal(value);
          });
        }
      });

    });
  }
});
