import { expect } from 'chai';
import * as def from '../../../src/_provider/definitions';

export function generalSingleSyncTests(Single) {
  describe.skip('sync (live API - not yet implemented)', function() {
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
}
