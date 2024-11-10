import { expect } from 'chai';
import * as Api from '../utils/apiStub';
import { classConfigs, getSingle } from '../utils/singleStub';


describe('Score', () => {

  Api.setGlobals();
  Api.setStub({});

  classConfigs.forEach(config => {
    describe(config.name, () => {
      it('Check 0', () => {
        const single = getSingle(config.name);

        single.setScore(0);
        expect(single.getScore()).to.equal(0);

        single.setScore(undefined);
        expect(single.getScore()).to.equal(0);

        single.setScore(null);
        expect(single.getScore()).to.equal(0);

        single.setAbsoluteScore(0);
        expect(single.getAbsoluteScore()).to.equal(0);

        single.setAbsoluteScore(undefined);
        expect(single.getAbsoluteScore()).to.equal(0);

        single.setAbsoluteScore(null);
        expect(single.getAbsoluteScore()).to.equal(0);
      });
      it('10 point check', () => {
        const single = getSingle(config.name);

        for (let i = 1; i < 11; i++) {
          single.setScore(i);
          expect(single.getScore()).to.equal(i);
        }
      });
      it('100 point check', () => {
        const single = getSingle(config.name);
        const singeStep = 100 / config.internalStates;
        for (let i = 1; i < 101; i++) {
          single.setAbsoluteScore(i);
          if (i < singeStep) {
            expect(single.getAbsoluteScore(), `${i} => ${singeStep}`).to.equal(singeStep);
          } else {
            const exp = Math.round(i / singeStep) * singeStep;
            expect(single.getAbsoluteScore(), `${i} => ${exp}`).to.equal(exp);
          }
        }
      });
      it('100 point to 10 point', () => {
        const testArray = {
          1: 1,
          5: 1,
          10: 1,
          14: 1,
          15: 2,
          50: 5,
          93: 9,
          99: 10,
          100: 10,
        };

        const single = getSingle(config.name);

        for (let i in testArray) {
          single.setAbsoluteScore(i);
          expect(single.getScore(), `${i} => ${testArray[i]}`).to.equal(testArray[i]);
        }
      });
      it('10 point to 100 point', () => {
        const testArray = {
          1: 10,
          2: 20,
          3: 30,
          4: 40,
          5: 50,
          6: 60,
          7: 70,
          8: 80,
          9: 90,
          10: 100,
        };

        const single = getSingle(config.name);

        for (let i in testArray) {
          single.setScore(i);
          expect(single.getAbsoluteScore(), `${i} => ${testArray[i]}`).to.equal(testArray[i]);
        }
      });
    });
  });
});

describe('Start/Finish Dates', () => {
  Api.setGlobals();
  Api.setStub({});

  classConfigs.forEach(config => {
    describe(config.name, () => {
      it('Check start/finish date', () => {
        const single = getSingle(config.name);

        single.setStartDate('1970-01-01');
        if (single.supportsDates()) {
          expect(single.getStartDate()).to.equal('1970-01-01');
        } else {
          expect(single.getStartDate()).to.equal(null);
        }

        single.setFinishDate('1970-01-02');
        if (single.supportsDates()) {
          expect(single.getFinishDate()).to.equal('1970-01-02');
        } else {
          expect(single.getFinishDate()).to.equal(null);
        }
      });
    });
  });
});

describe('Rewatch Count', () => {
  Api.setGlobals();
  Api.setStub({});

  classConfigs.forEach(config => {
    describe(config.name, () => {
      it('Check Rewatch Count', () => {
        const single = getSingle(config.name);

        single.setRewatchCount(2);
        if (single.supportsRewatching()) {
          expect(single.getRewatchCount()).to.equal(2);
        } else {
          expect(single.getRewatchCount()).to.equal(null);
        }
      });
    });
  });
});
