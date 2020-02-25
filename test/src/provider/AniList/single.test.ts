import { expect } from 'chai';
import { Single } from './../../../../src/_provider/AniList/single';
import * as utils from './../../../../src/utils/general';
import * as def from './../../../../src/_provider/defintions';

import * as request from 'request';

global.con = require('./../../../../src/utils/console');
global.con.log = function() {};

setGlobals()
function setGlobals() {
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
      defaultUrl: 'https://anilist.co/anime/21/One-Piece/',
      noMalEntry: 'https://anilist.co/manga/115067/Kagami-no-Kuni-no-Iris-SCP-Foundation/',
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


  });

  describe('API', function () {
    describe('Update', function () {
      it('Main Url', async function () {
        var singleEntry = new Single(global.testData.apiTest.defaultUrl);
        await singleEntry.update();
      })
      it('No Mal Entry', async function () {
        var singleEntry = new Single(global.testData.apiTest.noMalEntry);
        await singleEntry.update();
      })
      it('MAL Url', async function () {
        var singleEntry = new Single('https://myanimelist.net/anime/21/One_Piece');
        await singleEntry.update();
      })
      it('Non existing MAL url', async function () {
        var singleEntry = new Single('https://myanimelist.net/anime/13371337');
        await singleEntry.update();
      })
      it('No Authorization', async function () {
        global.api.token = '';
        var singleEntry = new Single(global.testData.apiTest.defaultUrl);
        await singleEntry.update();
        setGlobals();
      })
      it('Server Offline', async function () {
        global.api.status = 504;
        var singleEntry = new Single(global.testData.apiTest.defaultUrl);
        await singleEntry.update();
        setGlobals();
      })
    });
  });
});
