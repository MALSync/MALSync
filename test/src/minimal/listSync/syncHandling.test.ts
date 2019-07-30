import { expect } from 'chai';
import { getType, changeCheck, missingCheck } from './../../../../src/minimal/minimalApp/listSync/syncHandler';

const helper = {
  getItem: function(){
    return {
      title: 'test',
      type: 'anime',
      uid: 22,
      malId: 19815,
      watchedEp: 15,
      totalEp: 24,
      status: 6,
      score: 6,
      diff: {},
      url: 'https://myanimelist.net/anime/19815',
    }
  },
  getMasterSlave(){
    var el = {
      diff: false,
      master: helper.getItem(),
      slaves: [
        helper.getItem(),
        helper.getItem()
      ]
    };

    el.slaves[0].url = 'https://kitsu.io/anime/no-game-no-life';
    el.slaves[1].url = 'https://anilist.co/anime/19815/No-Game-No-Life/';
    return el;
  }
}

describe('Sync Handling', function () {
  describe('getType', function () {
    it('Myanimelist', function () {
      expect(getType('https://myanimelist.net/anime/19815/No_Game_No_Life')).to.equal("MAL");
    });
    it('AniList', function () {
      expect(getType('https://anilist.co/anime/19815/No-Game-No-Life/')).to.equal("ANILIST");
    });
    it('Kitsu', function () {
      expect(getType('https://kitsu.io/anime/no-game-no-life')).to.equal("KITSU");
    });
    it('Simkl', function () {
      expect(() => getType('https://simkl.com/anime/46128/no-game-no-life')).to.throw();
    });
    it('Random', function () {
      expect(() => getType('Random')).to.throw();
    });
  });

  describe('changeCheck', function () {
    var mode = 'mirror';
    it('No Change', function () {
      var item = helper.getMasterSlave();
      changeCheck(item, mode);
      expect(item.diff).to.equal(false);
    });

    it('Slave Change', function () {
      var item = helper.getMasterSlave();
      item.slaves[0].watchedEp = 22;
      var diff = {"watchedEp": 15};
      changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal({});
    });

    it('Master Change', function () {
      var item = helper.getMasterSlave();
      item.master.watchedEp = 22;
      var diff = {"watchedEp": 22};
      changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal(diff);
    });

    it('Episode Change', function () {
      var item = helper.getMasterSlave();
      item.master.watchedEp = 22;
      var diff = {"watchedEp": 22};
      changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal(diff);
    });

    it('Status Change', function () {
      var item = helper.getMasterSlave();
      item.master.status = 2;
      var diff = {"status": 2};
      changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal(diff);
    });

    it('Score Change', function () {
      var item = helper.getMasterSlave();
      item.master.score = 2;
      var diff = {"score": 2};
      changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal(diff);
    });

    it('Master Complete', function () {
      var item = helper.getMasterSlave();
      item.master.status = 2;
      item.master.watchedEp = 2;
      item.slaves[1].totalEp = 22;
      var diff1 = {
        "status": 2,
        "watchedEp": 24
      };
      var diff2 = {
        "status": 2,
        "watchedEp": 22
      };
      changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff1);
      expect(item.slaves[1].diff).to.deep.equal(diff2);
    });
  });

  describe('missingCheck', function () {
    var typeArray = ['MAL', 'KITSU', 'ANILIST'];
    var mode = 'mirror';

    it('No missing', function () {
      var item = helper.getMasterSlave();
      var miss = [];
      missingCheck(item, miss, typeArray, mode);
      expect(miss).to.deep.equal([]);
    });

    it('missing', function () {
      var item = helper.getMasterSlave();
      var res = helper.getItem();
      var miss = [];
      item.slaves.pop();
      res.syncType = 'ANILIST';
      res.error = null;
      delete res.diff;
      delete res.totalEp;
      delete res.type;
      delete res.uid;

      missingCheck(item, miss, typeArray, mode);
      expect(miss).to.deep.equal([res]);
    });
  });

});
