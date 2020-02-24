import { expect } from 'chai';
import { Single } from './../../../../src/_provider/AniList/single';
import * as utils from './../../../../src/utils/general';
import * as def from './../../../../src/_provider/defintions';

global.con = require('./../../../../src/utils/console');
global.con.log = function() {};

setGlobals()
function setGlobals() {
  global.api = {
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
            expect(single.type).equal(el.type);
          }else{
            expect(() => new Single(el.url)).to.throw();
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
});
