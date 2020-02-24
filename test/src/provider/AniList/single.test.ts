import { expect } from 'chai';
import { Single } from './../../../../src/_provider/AniList/single';
import * as def from './../../../../src/_provider/defintions';

global.con = require('./../../../../src/utils/console');
global.con.log = function() {};


describe('AniList single', function () {
  before(function () {
    global.api = {
    }
  })

  describe('Dry', function () {
    var singleEntry = new Single('https://anilist.co/anime/98976');

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
