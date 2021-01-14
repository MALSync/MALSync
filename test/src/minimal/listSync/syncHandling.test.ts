import { expect } from 'chai';
import * as sync from '../../../../src/minimal/minimalApp/listSync/syncHandler';
import * as Api from '../../utils/apiStub';

const helper = {
  getItem() {
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
    };
  },
  getMasterSlave() {
    const el = {
      diff: false,
      master: helper.getItem(),
      slaves: [helper.getItem(), helper.getItem()],
    };

    el.slaves[0].url = 'https://kitsu.io/anime/no-game-no-life';
    el.slaves[1].url = 'https://anilist.co/anime/19815/No-Game-No-Life/';
    return el;
  },
};

describe('Sync Handling', function() {
  describe('getType', function() {
    it('Myanimelist', function() {
      expect(
        sync.getType('https://myanimelist.net/anime/19815/No_Game_No_Life'),
      ).to.equal('MAL');
    });
    it('AniList', function() {
      expect(
        sync.getType('https://anilist.co/anime/19815/No-Game-No-Life/'),
      ).to.equal('ANILIST');
    });
    it('Kitsu', function() {
      expect(sync.getType('https://kitsu.io/anime/no-game-no-life')).to.equal(
        'KITSU',
      );
    });
    it('Simkl', function() {
      expect(
        sync.getType('https://simkl.com/anime/46128/no-game-no-life'),
      ).to.equal('SIMKL');
    });
    it('Random', function() {
      expect(() => sync.getType('Random')).to.throw();
    });
  });

  describe('changeCheck', function() {
    const mode = 'mirror';
    it('No Change', function() {
      const item = helper.getMasterSlave();
      sync.changeCheck(item, mode);
      expect(item.diff).to.equal(false);
    });

    it('No Master', function() {
      const item = helper.getMasterSlave();
      item.slaves[0].watchedEp = 22;
      delete item.master;
      sync.changeCheck(item, mode);
      expect(item.diff).to.equal(false);
    });

    it('Slave Change', function() {
      const item = helper.getMasterSlave();
      item.slaves[0].watchedEp = 22;
      const diff = { watchedEp: 15 };
      sync.changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal({});
    });

    it('Master Change', function() {
      const item = helper.getMasterSlave();
      item.master.watchedEp = 22;
      const diff = { watchedEp: 22 };
      sync.changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal(diff);
    });

    it('Episode Change', function() {
      const item = helper.getMasterSlave();
      item.master.watchedEp = 22;
      const diff = { watchedEp: 22 };
      sync.changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal(diff);
    });

    it('Status Change', function() {
      const item = helper.getMasterSlave();
      item.master.status = 2;
      const diff = { status: 2 };
      sync.changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal(diff);
    });

    it('Score Change', function() {
      const item = helper.getMasterSlave();
      item.master.score = 2;
      const diff = { score: 2 };
      sync.changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff);
      expect(item.slaves[1].diff).to.deep.equal(diff);
    });

    it('Master Complete', function() {
      const item = helper.getMasterSlave();
      item.master.status = 2;
      item.master.watchedEp = 2;
      item.slaves[1].totalEp = 22;
      const diff1 = {
        status: 2,
        watchedEp: 24,
      };
      const diff2 = {
        status: 2,
        watchedEp: 22,
      };
      sync.changeCheck(item, mode);
      expect(item.diff).to.equal(true);
      expect(item.slaves[0].diff).to.deep.equal(diff1);
      expect(item.slaves[1].diff).to.deep.equal(diff2);
    });
  });

  describe('missingCheck', function() {
    const typeArray = ['MAL', 'KITSU', 'ANILIST'];
    const mode = 'mirror';

    it('No missing', function() {
      const item = helper.getMasterSlave();
      const miss = [];
      sync.missingCheck(item, miss, typeArray, mode);
      expect(miss).to.deep.equal([]);
    });

    it('missing', function() {
      const item = helper.getMasterSlave();
      const res: any = helper.getItem();
      const miss = [];
      item.slaves.pop();
      res.syncType = 'ANILIST';
      res.error = null;
      delete res.diff;
      delete res.totalEp;
      delete res.type;
      delete res.uid;

      sync.missingCheck(item, miss, typeArray, mode);
      expect(miss).to.deep.equal([res]);
    });

    it('No Master', function() {
      const item = helper.getMasterSlave();
      const res: any = helper.getItem();
      const miss = [];
      item.slaves.pop();
      res.syncType = 'ANILIST';
      res.error = null;
      delete res.diff;
      delete res.totalEp;
      delete res.type;
      delete res.uid;

      delete item.master;

      sync.missingCheck(item, miss, typeArray, mode);
      expect(miss).to.deep.equal([]);
    });
  });

  describe('mapToArray', function() {
    it('Master', function() {
      const list = {};
      const item = helper.getItem();
      const item2 = helper.getItem();
      item2.malId = 3123;
      sync.mapToArray([item, item2], list, true);
      expect(list[item.malId].master).to.deep.equal(item);
      expect(list[item.malId].slaves).to.deep.equal([]);
      expect(list[3123].master).to.deep.equal(item2);
      expect(list[3123].slaves).to.deep.equal([]);
    });

    it('Slaves', function() {
      const list = {};
      const item = helper.getItem();
      const item2 = helper.getItem();
      item2.malId = 3123;
      sync.mapToArray([item], list, true);
      sync.mapToArray([item, item2], list, false);
      sync.mapToArray([item, item2], list, false);
      expect(list[item.malId].master).to.deep.equal(item);
      expect(list[item.malId].slaves).to.deep.equal([item, item]);
      expect(list[3123].master).to.deep.equal({});
      expect(list[3123].slaves).to.deep.equal([item2, item2]);
    });

    it('No Mal id', function() {
      const list = {};
      const item = helper.getItem();
      const item2 = helper.getItem();
      item2.malId = NaN;
      sync.mapToArray([item], list, true);
      sync.mapToArray([item], list, false);
      sync.mapToArray([item2], list, false);
      expect(list[item.malId].master).to.deep.equal(item);
      expect(list[item.malId].slaves).to.deep.equal([item]);
    });
  });

  describe('getListProvider', function() {
    const providerList = sync.getListProvider({
      mal: 'mal',
      anilist: 'anilist',
      kitsu: 'kitsu',
      simkl: 'simkl',
    });
    it('providerType', function() {
      for (const i in providerList) {
        expect(providerList[i].providerType).to.be.oneOf([
          'MAL',
          'ANILIST',
          'KITSU',
          'SIMKL',
        ]);
      }
    });
    it('providerSettings', function() {
      for (const i in providerList) {
        expect(providerList[i].providerSettings).to.be.oneOf([
          'mal',
          'anilist',
          'kitsu',
          'simkl',
        ]);
      }
    });
  });

  describe('retriveLists', function() {
    function getProviderListList() {
      const providerList = sync.getListProvider({
        mal: {
          text: 'Init',
          list: null,
          master: false,
        },
        anilist: {
          text: 'Init',
          list: null,
          master: false,
        },
        kitsu: {
          text: 'Init',
          list: null,
          master: false,
        },
        simkl: {
          text: 'Init',
          list: null,
          master: false,
        },
      });

      for (const i in providerList) {
        providerList[i].listProvider = providerList[i].providerType;
      }

      return providerList;
    }

    let getListStub = (prov, type) => {
      return new Promise((resolve, reject) => {
        resolve(prov);
      });
    };

    it('MAL Master', async function() {
      const stub = Api.getStub({
        settings: {
          syncMode: 'MAL'
        }
      });
      Api.setStub(stub);

      const providerList = getProviderListList();
      const res = await sync.retriveLists(
        providerList,
        'anime',
        getListStub,
      );

      expect(res.master).equal('MAL');
      expect(res.slaves).to.not.include('MAL');
      expect(res.slaves).to.have.length(res.typeArray.length - 1);
      expect(res.typeArray).to.deep.equal(['MAL', 'ANILIST', 'KITSU', 'SIMKL']);
    });

    it('ANILIST Master', async function() {
      const stub = Api.getStub({
        settings: {
          syncMode: 'ANILIST',
        },
      });
      Api.setStub(stub);

      const providerList = getProviderListList();
      const res = await sync.retriveLists(
        providerList,
        'anime',
        getListStub,
      );

      expect(res.master).equal('ANILIST');
      expect(res.slaves).to.have.length(res.typeArray.length - 1);
      expect(res.slaves).to.not.include('ANILIST');
    });

    it('KITSU Master', async function() {
      const stub = Api.getStub({
        settings: {
          syncMode: 'KITSU',
        },
      });
      Api.setStub(stub);
      const providerList = getProviderListList();
      const res = await sync.retriveLists(
        providerList,
        'anime',
        getListStub,
      );

      expect(res.master).equal('KITSU');
      expect(res.slaves).to.have.length(res.typeArray.length - 1);
      expect(res.slaves).to.not.include('KITSU');
    });

    it('SIMKL Master', async function() {
      const stub = Api.getStub({
        settings: {
          syncMode: 'SIMKL',
        },
      });
      Api.setStub(stub);

      const providerList = getProviderListList();
      const res = await sync.retriveLists(
        providerList,
        'anime',
        getListStub,
      );

      expect(res.master).equal('SIMKL');
      expect(res.slaves).to.have.length(res.typeArray.length - 1);
      expect(res.slaves).to.not.include('SIMKL');
    });

    it('SIMKL MAL Master', async function() {
      const stub = Api.getStub({
        settings: {
          syncMode: 'SIMKL',
          syncModeSimkl: 'MAL'
        },
      });
      Api.setStub(stub);

      const providerList = getProviderListList();
      const res = await sync.retriveLists(providerList, 'manga', getListStub);

      expect(res.master).equal('MAL');
      expect(res.slaves).to.have.length(res.typeArray.length - 1);
      expect(res.slaves).to.not.include('MAL');
    });

    it('typeArray', async function() {
      getListStub = (prov, type) => {
        return new Promise((resolve, reject) => {
          if (prov === 'KITSU') {
            reject([]);
            return;
          }
          resolve(prov);
        });
      };

      const stub = Api.getStub({
        settings: {
          syncMode: 'MAL',
        },
      });
      Api.setStub(stub);

      const providerList = getProviderListList();
      const res = await sync.retriveLists(
        providerList,
        'anime',
        getListStub,
      );

      expect(res.typeArray).to.deep.equal(['MAL', 'ANILIST', 'SIMKL']);
    });
  });
});
