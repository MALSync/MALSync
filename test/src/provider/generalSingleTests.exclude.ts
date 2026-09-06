import { expect } from 'chai';
import {
  UrlNotSupportedError,
  NotFoundError,
  NotAutenticatedError,
  ServerOfflineError,
} from '../../../src/_provider/Errors';

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
              .to.throw(UrlNotSupportedError);
          }
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
          .catch(e => expect(e).to.be.instanceOf(NotFoundError));
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
          .catch(e => expect(e).to.be.instanceOf(NotAutenticatedError));
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
          .catch(e => expect(e).to.be.instanceOf(ServerOfflineError));
        setGlobals();
      });
    });

  });
}
