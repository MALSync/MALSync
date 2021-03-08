import { expect } from 'chai';
import * as def from '../../../src/_provider/definitions';

export function generalSingleTests(Single, setGlobals, titlePrefix = '') {
  describe('Url', function() {
    describe('Constructor', function() {
      global.testData.urlTest.forEach(el => {
        it(el.url, function() {
          if (!el.error) {
            let single;
            expect(() => (single = new Single(el.url))).not.to.throw();
            expect(single.getType()).equal(el.type);
          } else {
            expect(() => new Single(el.url))
              .to.throw()
              .to.include({ code: def.errorCode.UrlNotSuported });
          }
        });
      });
    });
  });

  describe('Dry', function() {
    const singleEntry = new Single(global.testData.urlTest[0].url);
    before(async function() {
      this.timeout(50000);
      await singleEntry.update();
    });

    describe('Status', function() {
      [
        def.status.Watching,
        def.status.Completed,
        def.status.Onhold,
        def.status.Dropped,
        def.status.PlanToWatch,
        def.status.Rewatching,
      ].forEach(el => {
        it(def.status[el], function() {
          singleEntry.setStatus(el);
          if (
            el === def.status.Rewatching &&
            !singleEntry.supportsRewatching()
          ) {
            expect(singleEntry.getStatus()).equal(def.status.Watching);
          } else {
            expect(singleEntry.getStatus()).equal(el);
          }
        });
      });
    });

    describe('Score', function() {
      [
        def.score.NoScore,
        def.score.R1,
        def.score.R2,
        def.score.R3,
        def.score.R4,
        def.score.R5,
        def.score.R6,
        def.score.R7,
        def.score.R8,
        def.score.R9,
        def.score.R10,
      ].forEach(el => {
        it(def.score[el], function() {
          singleEntry.setScore(el);
          expect(singleEntry.getScore()).equal(el);
        });
      });
    });

    describe('Episode', function() {
      [0, 2, 11].forEach(el => {
        it(`${el}`, function() {
          singleEntry.setEpisode(el);
          expect(singleEntry.getEpisode()).equal(el);
        });
      });
    });

    if (!api.noManga) {
      describe('Volume', function() {
        [0, 2, 21].forEach(el => {
          it(`${el}`, function() {
            singleEntry.setVolume(el);
            expect(singleEntry.getVolume()).equal(el);
          });
        });
      });
    }

    describe('Streaming Url', function() {
      [
        'https://myanimelist.net/anime/13371337',
        'https://myanimelist.net/anime/13',
        'https://myanimelist.net/manga/1',
      ].forEach(el => {
        it(`${el}`, function() {
          singleEntry.setStreamingUrl(el);
          expect(singleEntry.getStreamingUrl()).equal(el);
        });
      });
    });

    describe('Check Sync', function() {
      if (api.noManga) return;
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
        it(el.name, async function() {
          singleEntry.finishRewatchingMessage = () => true;
          singleEntry.finishWatchingMessage = () => true;
          singleEntry.startWatchingMessage = () => true;
          singleEntry.startRewatchingMessage = () => true;
          singleEntry.setEpisode(el.curEp);
          singleEntry.setStatus(el.curStatus);
          singleEntry.setVolume(el.curVol);
          expect(await singleEntry.checkSync(el.ep, el.vol)).equal(el.result);
        });
      });
    });
  });

  describe('API', function() {
    describe('Update', function() {
      it('Main Url', async function() {
        this.timeout(50000);
        const tData = global.testData.apiTest.defaultUrl;
        const singleEntry = new Single(tData.url);
        await singleEntry.update();
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isOnList()).equal(true);
        expect(singleEntry.isAuthenticated()).equal(true);
        expect(singleEntry.getTitle()).equal(titlePrefix + tData.title);
        expect(singleEntry.getTotalEpisodes()).equal(tData.eps);
        expect(singleEntry.getTotalVolumes()).equal(tData.vol);
        expect(singleEntry.getMalUrl()).equal(tData.malUrl);
        expect(await singleEntry.getImage()).equal(tData.image);
        expect((await singleEntry.getRating()).length).equal(
          tData.rating.length,
        );
        expect(singleEntry.getCacheKey()).equal(tData.cacheKey);
      });
      it('Not on list', async function() {
        this.timeout(50000);
        const tData = global.testData.apiTest.notOnListUrl;
        if (!tData) return;
        const singleEntry = new Single(tData.url);
        await singleEntry.update();
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isOnList()).equal(false);
        expect(singleEntry.isAuthenticated()).equal(true);
        expect(singleEntry.getTitle()).equal(titlePrefix+tData.title);
        expect(singleEntry.getTotalEpisodes()).equal(tData.eps);
        expect(singleEntry.getTotalVolumes()).equal(tData.vol);
        expect(singleEntry.getMalUrl()).equal(tData.malUrl);
      });
      it('No Mal Entry', async function() {
        this.timeout(50000);
        const tData = global.testData.apiTest.noMalEntry;
        if (!tData) return;
        const singleEntry = new Single(tData.url);
        await singleEntry.update();
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isOnList()).equal(true);
        expect(singleEntry.isAuthenticated()).equal(true);
        expect(singleEntry.getTitle()).equal(titlePrefix+tData.title);
        expect(singleEntry.getTotalEpisodes()).equal(tData.eps);
        expect(singleEntry.getTotalVolumes()).equal(tData.vol);
        expect(singleEntry.getMalUrl()).equal(null);
        expect(singleEntry.getCacheKey()).equal(tData.cacheKey);
      });
      it('MAL Url', async function() {
        this.timeout(50000);
        const tData = global.testData.apiTest.malUrl;
        if (!tData) return;
        const singleEntry = new Single(tData.url);
        await singleEntry.update();
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isOnList()).equal(true);
        expect(singleEntry.isAuthenticated()).equal(true);
        expect(singleEntry.getTitle()).equal(titlePrefix+tData.title);
        expect(singleEntry.getTotalEpisodes()).equal(tData.eps);
        expect(singleEntry.getTotalVolumes()).equal(tData.vol);
        expect(singleEntry.getMalUrl()).equal(tData.malUrl);
      });
      it('Non existing MAL url', async function() {
        this.timeout(50000);
        const tData = global.testData.apiTest.nonExistingMAL;
        if (!tData) return;
        const singleEntry = new Single(tData.url);
        await singleEntry
          .update()
          .then(() => {
            throw 'was not supposed to succeed';
          })
          .catch(e =>
            expect(e).to.include({ code: def.errorCode.EntryNotFound }),
          );
        expect(singleEntry.isAuthenticated()).equal(true);
      });
      it('No Authorization', async function() {
        this.timeout(50000);
        global.api.token = '';
        const tData = global.testData.apiTest.defaultUrl;
        if (!global.testData.apiTest.nonExistingMAL) return;
        const singleEntry = new Single(tData.url);
        await singleEntry
          .update()
          .then(() => {
            throw 'was not supposed to succeed';
          })
          .catch(e =>
            expect(e).to.include({ code: def.errorCode.NotAutenticated }),
          );
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isAuthenticated()).equal(false);
        setGlobals();
      });
      it('Server Offline', async function() {
        this.timeout(50000);
        global.api.status = 504;
        const tData = global.testData.apiTest.defaultUrl;
        if (!global.testData.apiTest.nonExistingMAL) return;
        const singleEntry = new Single(tData.url);
        await singleEntry
          .update()
          .then(() => {
            throw 'was not supposed to succeed';
          })
          .catch(e =>
            expect(e).to.include({ code: def.errorCode.ServerOffline }),
          );
        setGlobals();
      });
    });

    describe('sync', function() {
      it('Persistence', async function() {
        this.timeout(50000);
        const tData = global.testData.apiTest.defaultUrl;
        const singleEntry = new Single(tData.url);
        await singleEntry.update();
        singleEntry
          .setScore(def.score.R5)
          .setStatus(def.status.Watching)
          .setEpisode(2);
        await singleEntry.sync();

        singleEntry
          .setScore(def.score.R6)
          .setStatus(def.status.Completed)
          .setEpisode(3);

        expect(singleEntry.getScore()).equal(def.score.R6);
        expect(singleEntry.getStatus()).equal(def.status.Completed);
        expect(singleEntry.getEpisode()).equal(3);

        await singleEntry.update();
        expect(singleEntry.getScore()).equal(def.score.R5);
        expect(singleEntry.getStatus()).equal(def.status.Watching);
        expect(singleEntry.getEpisode()).equal(2);
      });

      it('Undo', async function() {
        this.timeout(50000);
        const tData = global.testData.apiTest.defaultUrl;
        const singleEntry = new Single(tData.url);
        await singleEntry.update();

        const tempState = {
          episode: singleEntry.getEpisode(),
          volume: singleEntry.getVolume(),
          status: singleEntry.getStatus(),
          score: singleEntry.getScore(),
        };

        singleEntry
          .setScore(def.score.R6)
          .setStatus(def.status.PlanToWatch)
          .setEpisode(2);

        await singleEntry.sync();

        await singleEntry.undo();

        await singleEntry.update();

        expect(singleEntry.getScore()).equal(tempState.score);
        expect(singleEntry.getStatus()).equal(tempState.status);
        expect(singleEntry.getEpisode()).equal(tempState.episode);
        expect(singleEntry.getVolume()).equal(tempState.volume);
      });

      if (!api.noLimitless) {
        it('Over totalEp no limit', async function() {
          this.timeout(50000);
          const tData = global.testData.apiTest.defaultUrl;
          const singleEntry = new Single(tData.url);
          await singleEntry.update();
          singleEntry
            .setScore(def.score.R5)
            .setStatus(def.status.Watching)
            .setEpisode(1000);
          await singleEntry.sync();

          await singleEntry.update();
          expect(singleEntry.getEpisode()).equal(1000);
        });
      }

      it('Over totalEp', async function() {
        this.timeout(50000);
        if (!global.testData.apiTest.hasTotalEp) return;
        const tData = global.testData.apiTest.hasTotalEp;
        var singleEntry = new Single(tData.url);
        await singleEntry.update();
        singleEntry
          .setScore(def.score.R5)
          .setStatus(def.status.Watching)
          .setEpisode(1);
        var singleEntry = new Single(tData.url);
        await singleEntry.update();
        await singleEntry.sync();
        singleEntry
          .setScore(def.score.R5)
          .setStatus(def.status.Watching)
          .setEpisode(1000);
        await singleEntry.sync();

        await singleEntry.update();
        expect(singleEntry.getEpisode()).equal(singleEntry.getTotalEpisodes());
      });
    });
  });
}
