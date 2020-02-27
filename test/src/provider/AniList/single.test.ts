import { expect } from 'chai';
import { Single } from './../../../../src/_provider/AniList/single';
import * as utils from './../../../../src/utils/general';
import * as def from './../../../../src/_provider/defintions';

import * as request from 'request';

setGlobals()
function setGlobals() {
  global.con = require('./../../../../src/utils/console');
  global.con.log = function() {};
  global.con.error = function() {};
  global.con.info = function() {};

  global.api = {
    token: process.env.ANILIST_API_KEY,
    settings: {
      get: function(key) {
        if('anilistToken') return global.api.token;
        throw 'key not defined';
      }
    },
    status: 200,
    request: {
      xhr: async function(post, conf, data) {
        return new Promise(function(resolve, reject) {
          var options = {
            url: conf.url,
            headers: conf.headers,
            body: conf.data
          }
          request.post(options, (error, response, body) => {
            resolve({
              responseText: body,
              status: global.api.status
            })
          });
        });
      }
    },
  }

  global.btoa = (input) => input;

  global.utils = utils;

  global.testData = {
    urlTest: [
      {
        url: 'https://anilist.co/anime/19815/No-Game-No-Life/',
        error: false,
        type: 'anime',
      },
      {
        url: 'https://anilist.co/manga/78397/No-Game-No-Life/',
        error: false,
        type: 'manga',
      },
      {
        url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
        error: false,
        type: 'anime',
      },
      {
        url: 'https://kitsu.io/anime/no-game-no-life',
        error: true,
        type: 'anime',
      },
      {
        url: 'https://simkl.com/anime/46128/no-game-no-life',
        error: true,
        type: 'anime',
      }
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://anilist.co/anime/21/One-Piece/',
        displayUrl: 'https://anilist.co/anime/21',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/nx21-tXMN3Y20PIL9.jpg',
        rating: 83,
        cacheKey: 21,
      },
      notOnListUrl: {
        url: 'https://anilist.co/anime/10083/Shiki-Specials/',
        displayUrl: 'https://anilist.co/anime/10083',
        malUrl: 'https://myanimelist.net/anime/10083/Shiki%20Specials',
        title: "Shiki Specials",
        eps: 2,
        vol: 0,
      },
      noMalEntry: {
        url: 'https://anilist.co/manga/115067/Kagami-no-Kuni-no-Iris-SCP-Foundation/',
        displayUrl: 'https://anilist.co/manga/115067',
        title: 'Kagami no Kuni no Iris: SCP Foundation',
        eps: 0,
        vol: 0,
        cacheKey: 'anilist:115067',
      },
      malUrl: {
        url: 'https://myanimelist.net/anime/21/One_Piece',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        displayUrl: 'https://anilist.co/anime/21',
        title: 'One Piece',
        eps: 0,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://myanimelist.net/anime/13371337',
      },
    }
  }
}

describe('AniList single', function () {
  before(function () {
    setGlobals();
  })

  describe('Url', function () {
    describe('Constructor', function () {
      global.testData.urlTest.forEach(el => {
        it(el.url, function () {
          if(!el.error) {
            var single;
            expect(() => single = new Single(el.url)).not.to.throw();
            expect(single.getType()).equal(el.type);
          }else{
            expect(() => new Single(el.url)).to.throw().to.include({code: def.errorCode.UrlNotSuported});
          }
        });
      })
    });
  });

  describe('Dry', function () {
    var singleEntry = new Single(global.testData.urlTest[0].url);
    before(async function () {
      await singleEntry.update();
    })

    describe('Status', function () {
      [
        def.status.NoState,
        def.status.Watching,
        def.status.Completed,
        def.status.Onhold,
        def.status.Dropped,
        def.status.PlanToWatch,
        def.status.All,
        def.status.Rewatching
      ].forEach((el) => {
        it(def.status[el], function () {
          singleEntry.setStatus(el);
          expect(singleEntry.getStatus()).equal(el);
        })
      })

    });

    describe('Score', function () {
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
        def.score.R10
      ].forEach((el) => {
        it(def.score[el], function () {
          singleEntry.setScore(el);
          expect(singleEntry.getScore()).equal(el);
        })
      })

    });

    describe('Episode', function () {
      [
        0,
        2,
        21,
      ].forEach((el) => {
        it(el+'', function () {
          singleEntry.setEpisode(el);
          expect(singleEntry.getEpisode()).equal(el);
        })
      })
    });

    describe('Volume', function () {
      [
        0,
        2,
        21,
      ].forEach((el) => {
        it(el+'', function () {
          singleEntry.setVolume(el);
          expect(singleEntry.getVolume()).equal(el);
        })
      })
    });

    describe('Streaming Url', function () {
      [
        'https://myanimelist.net/anime/13371337',
        'https://myanimelist.net/anime/13',
        'https://myanimelist.net/manga/1',
      ].forEach((el) => {
        it(el+'', function () {
          singleEntry.setStreamingUrl(el);
          expect(singleEntry.getStreamingUrl()).equal(el);
        })
      })
    });


  });

  describe('API', function () {
    describe('Update', function () {
      it('Main Url', async function () {
        var tData = global.testData.apiTest.defaultUrl;
        var singleEntry = new Single(tData.url);
        await singleEntry.update();
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isOnList()).equal(true);
        expect(singleEntry.isAuthenticated()).equal(true);
        expect(singleEntry.getTitle()).equal(tData.title);
        expect(singleEntry.getTotalEpisodes()).equal(tData.eps);
        expect(singleEntry.getTotalVolumes()).equal(tData.vol);
        expect(singleEntry.getMalUrl()).equal(tData.malUrl);
        expect(singleEntry.getImage()).equal(tData.image);
        expect(singleEntry.getRating()).equal(tData.rating);
        expect(singleEntry.getCacheKey()).equal(tData.cacheKey);
      })
      it('Not on list', async function () {
        var tData = global.testData.apiTest.notOnListUrl;
        var singleEntry = new Single(tData.url);
        await singleEntry.update();
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isOnList()).equal(false);
        expect(singleEntry.isAuthenticated()).equal(true);
        expect(singleEntry.getTitle()).equal(tData.title);
        expect(singleEntry.getTotalEpisodes()).equal(tData.eps);
        expect(singleEntry.getTotalVolumes()).equal(tData.vol);
        expect(singleEntry.getMalUrl()).equal(tData.malUrl);
      })
      it('No Mal Entry', async function () {
        var tData = global.testData.apiTest.noMalEntry;
        var singleEntry = new Single(tData.url);
        await singleEntry.update();
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isOnList()).equal(true);
        expect(singleEntry.isAuthenticated()).equal(true);
        expect(singleEntry.getTitle()).equal(tData.title);
        expect(singleEntry.getTotalEpisodes()).equal(tData.eps);
        expect(singleEntry.getTotalVolumes()).equal(tData.vol);
        expect(singleEntry.getMalUrl()).equal(null);
        expect(singleEntry.getCacheKey()).equal(tData.cacheKey);
      })
      it('MAL Url', async function () {
        var tData = global.testData.apiTest.malUrl;
        var singleEntry = new Single(tData.url);
        await singleEntry.update();
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isOnList()).equal(true);
        expect(singleEntry.isAuthenticated()).equal(true);
        expect(singleEntry.getTitle()).equal(tData.title);
        expect(singleEntry.getTotalEpisodes()).equal(tData.eps);
        expect(singleEntry.getTotalVolumes()).equal(tData.vol);
        expect(singleEntry.getMalUrl()).equal(tData.malUrl);
      })
      it('Non existing MAL url', async function () {
        var tData = global.testData.apiTest.nonExistingMAL;
        var singleEntry = new Single(tData.url);
        await singleEntry.update()
          .then(() => {throw 'was not supposed to succeed';})
          .catch((e) => expect(e).to.include({code: def.errorCode.EntryNotFound}));
        expect(singleEntry.isAuthenticated()).equal(true);
      })
      it('No Authorization', async function () {
        global.api.token = '';
        var tData = global.testData.apiTest.defaultUrl;
        var singleEntry = new Single(tData.url);
        await singleEntry.update()
          .then(() => {throw 'was not supposed to succeed';})
          .catch((e) => expect(e).to.include({code: def.errorCode.NotAutenticated}))
        expect(singleEntry.getDisplayUrl()).equal(tData.displayUrl);
        expect(singleEntry.isAuthenticated()).equal(false);
        setGlobals();
      })
      it('Server Offline', async function () {
        global.api.status = 504;
        var tData = global.testData.apiTest.defaultUrl;
        var singleEntry = new Single(tData.url);
        await singleEntry.update()
          .then(() => {throw 'was not supposed to succeed';})
          .catch((e) => expect(e).to.include({code: def.errorCode.ServerOffline}))
        setGlobals();
      })
    });

    describe('sync', function () {
      it('Persistence', async function () {
        var tData = global.testData.apiTest.defaultUrl;
        var singleEntry = new Single(tData.url);
        await singleEntry.update();
        singleEntry
          .setScore(def.score.R5)
          .setStatus(def.status.Watching)
          .setEpisode(2)
        await singleEntry.sync();

        singleEntry
          .setScore(def.score.R6)
          .setStatus(def.status.Completed)
          .setEpisode(3)

        expect(singleEntry.getScore()).equal(def.score.R6);
        expect(singleEntry.getStatus()).equal(def.status.Completed);
        expect(singleEntry.getEpisode()).equal(3);

        await singleEntry.update();
        expect(singleEntry.getScore()).equal(def.score.R5);
        expect(singleEntry.getStatus()).equal(def.status.Watching);
        expect(singleEntry.getEpisode()).equal(2);
      });

    });
  });
});
