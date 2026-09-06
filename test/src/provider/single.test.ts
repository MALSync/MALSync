import { expect } from 'chai';
import * as Api from '../utils/apiStub';
import * as def from '../../../src/_provider/definitions';
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

describe('Status', () => {
  Api.setGlobals();
  Api.setStub({});

  classConfigs.forEach(config => {
    describe(config.name, () => {
      [
        def.status.Watching,
        def.status.Completed,
        def.status.Onhold,
        def.status.Dropped,
        def.status.PlanToWatch,
        def.status.Rewatching,
        def.status.Considering,
      ].forEach(el => {
        it(def.status[el], () => {
          const single = getSingle(config.name);
          single.setStatus(el);
          if (el === def.status.Rewatching && !single.supportsRewatching()) {
            expect(single.getStatus()).to.equal(def.status.Watching);
          } else if (el === def.status.Considering && !single.supportsConsidering()) {
            expect(single.getStatus()).to.equal(def.status.PlanToWatch);
          } else {
            expect(single.getStatus()).to.equal(el);
          }
        });
      });
    });
  });
});

describe('Episode', () => {
  Api.setGlobals();
  Api.setStub({});

  classConfigs.forEach(config => {
    describe(config.name, () => {
      [0, 2, 11].forEach(el => {
        it(`${el}`, () => {
          const single = getSingle(config.name);
          single.setEpisode(el);
          expect(single.getEpisode()).to.equal(el);
        });
      });
    });
  });
});

describe('Volume', () => {
  Api.setGlobals();
  Api.setStub({});

  classConfigs.forEach(config => {
    if (config.noManga) return;
    describe(config.name, () => {
      [0, 2, 21].forEach(el => {
        it(`${el}`, () => {
          const single = getSingle(config.name);
          single.setVolume(el);
          expect(single.getVolume()).to.equal(el);
        });
      });
    });
  });
});

describe('Streaming Url', () => {
  Api.setGlobals();
  Api.setStub({});

  classConfigs.forEach(config => {
    describe(config.name, () => {
      [
        'https://myanimelist.net/anime/13371337',
        'https://myanimelist.net/anime/13',
        'https://myanimelist.net/manga/1',
      ].forEach(el => {
        it(`${el}`, () => {
          const single = getSingle(config.name);
          single.options = {};
          single.setStreamingUrl(el);
          expect(single.getStreamingUrl()).to.equal(el);
        });
      });
    });
  });
});

describe('Check Sync', () => {
  Api.setGlobals();
  Api.setStub({});

  classConfigs.forEach(config => {
    if (config.noManga) return;
    describe(config.name, () => {
      [
        {
          name: 'Default',
          ep: 3,
          vol: 2,
          curEp: 2,
          curVol: 4,
          curStatus: def.status.Watching,
          result: true,
        },
        {
          name: 'Fail',
          ep: 1,
          vol: 2,
          curEp: 2,
          curVol: 4,
          curStatus: def.status.Watching,
          result: false,
        },
        {
          name: 'Novel next Volume',
          ep: 2,
          vol: 2,
          curEp: 4,
          curVol: 1,
          curStatus: def.status.Watching,
          result: true,
        },
        {
          name: 'Novel current Volume',
          ep: 2,
          vol: 2,
          curEp: 4,
          curVol: 2,
          curStatus: def.status.Watching,
          result: false,
        },
        {
          name: 'Novel undefined volume fail',
          ep: 2,
          vol: undefined,
          curEp: 4,
          curVol: 2,
          curStatus: def.status.Watching,
          result: false,
        },
        {
          name: 'Novel undefined volume',
          ep: 5,
          vol: undefined,
          curEp: 4,
          curVol: 2,
          curStatus: def.status.Watching,
          result: true,
        },
        {
          name: 'Only update Volume if defined',
          ep: 2,
          vol: 1,
          curEp: 4,
          curVol: 0,
          curStatus: def.status.Watching,
          result: false,
        },
        {
          name: 'Update volume if not defined if higher than vol 1',
          ep: 1,
          vol: 2,
          curEp: 5,
          curVol: 0,
          curStatus: def.status.Watching,
          result: true,
        },
        {
          name: 'Volume only page [start] (Komga)',
          ep: 0,
          vol: 1,
          curEp: 0,
          curVol: 0,
          curStatus: def.status.Watching,
          result: true,
        },
        {
          name: 'Volume only page [continue] (Komga)',
          ep: 0,
          vol: 3,
          curEp: 0,
          curVol: 2,
          curStatus: def.status.Watching,
          result: true,
        },
        {
          name: 'Volume only page [With ep] (Komga)',
          ep: 5,
          vol: 3,
          curEp: 0,
          curVol: 2,
          curStatus: def.status.Watching,
          result: true,
        },
        {
          name: 'Completed',
          ep: 4,
          vol: 2,
          curEp: 2,
          curVol: 4,
          curStatus: def.status.Completed,
          result: false,
        },
        {
          name: 'Rewatching',
          ep: 1,
          vol: 2,
          curEp: 2,
          curVol: 4,
          curStatus: def.status.Completed,
          result: true,
        },
      ].forEach(el => {
        it(el.name, async () => {
          const single = getSingle(config.name);
          single.finishRewatchingMessage = () => true;
          single.finishWatchingMessage = () => true;
          single.startWatchingMessage = () => true;
          single.startRewatchingMessage = () => true;
          single.setEpisode(el.curEp);
          single.setStatus(el.curStatus);
          single.setVolume(el.curVol);
          expect(await single.checkSync(el.ep, el.vol)).to.equal(el.result);
        });
      });
    });
  });
});
