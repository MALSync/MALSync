import { Single as MalSingle } from '../../../_provider/MyAnimeList_hybrid/single';
import { Single as AniListSingle } from '../../../_provider/AniList/single';
import { Single as KitsuSingle } from '../../../_provider/Kitsu/single';
import { Single as SimklSingle } from '../../../_provider/Simkl/single';

import { UserList as MalList } from '../../../_provider/MyAnimeList_hybrid/list';
import { UserList as AnilistList } from '../../../_provider/AniList/list';
import { UserList as KitsuList } from '../../../_provider/Kitsu/list';
import { UserList as SimklList } from '../../../_provider/Simkl/list';
import { getSyncMode } from '../../../_provider/helper';

export function generateSync(masterList: object, slaveLists: object[], mode, typeArray, list, missing) {
  mapToArray(masterList, list, true);

  for (const i in slaveLists) {
    mapToArray(slaveLists[i], list, false);
  }

  for (const i in list) {
    changeCheck(list[i], mode);
    missingCheck(list[i], missing, typeArray, mode);
  }
}

export function getType(url) {
  if (url.indexOf('anilist.co') !== -1) return 'ANILIST';
  if (url.indexOf('kitsu.io') !== -1) return 'KITSU';
  if (url.indexOf('myanimelist.net') !== -1) return 'MAL';
  if (url.indexOf('simkl.com') !== -1) return 'SIMKL';
  throw 'Type not found';
}

export function mapToArray(provierList, resultList, masterM = false) {
  for (let i = 0; i < provierList.length; i++) {
    const el = provierList[i];
    let temp = resultList[el.malId];
    if (typeof temp === 'undefined') {
      temp = {
        diff: false,
        master: {},
        slaves: [],
      };
    }

    if (masterM) {
      temp.master = el;
    } else {
      el.diff = {};
      temp.slaves.push(el);
    }
    if (!Number.isNaN(el.malId) && el.malId) {
      resultList[el.malId] = temp;
    } else {
      // TODO: List them
    }
  }
}

export function changeCheck(item, mode) {
  if (item.master && item.master.uid) {
    for (let i = 0; i < item.slaves.length; i++) {
      const slave = item.slaves[i];
      if (slave.watchedEp !== item.master.watchedEp) {
        if (item.master.status === 2) {
          if (slave.watchedEp !== slave.totalEp) {
            item.diff = true;
            slave.diff.watchedEp = slave.totalEp;
          }
        } else {
          item.diff = true;
          slave.diff.watchedEp = item.master.watchedEp;
        }
      }
      if (slave.status !== item.master.status) {
        item.diff = true;
        slave.diff.status = item.master.status;
      }
      if (slave.score !== item.master.score) {
        item.diff = true;
        slave.diff.score = item.master.score;
      }
    }
  }
}

export function missingCheck(item, missing, types, mode) {
  if (item.master && item.master.uid) {
    const tempTypes: any[] = [];
    tempTypes.push(getType(item.master.url));
    for (let i = 0; i < item.slaves.length; i++) {
      const slave = item.slaves[i];
      tempTypes.push(getType(slave.url));
    }
    for (const t in types) {
      const type = types[t];
      if (!tempTypes.includes(type)) {
        missing.push({
          title: item.master.title,
          syncType: type,
          malId: item.master.malId,
          watchedEp: item.master.watchedEp,
          score: item.master.score,
          status: item.master.status,
          url: `https://myanimelist.net/${item.master.type}/${item.master.malId}`,
          error: null,
        });
      }
    }
  }
}

// Sync

export async function syncList(list, thisMissing) {
  for (const i in list) {
    const el = list[i];
    if (el.diff) {
      try {
        await syncListItem(el);
        el.diff = false;
      } catch (e) {
        con.error(e);
      }
    }
  }

  const missing = thisMissing.slice();
  for (const i in missing) {
    const miss = missing[i];
    con.log('Sync missing', miss);
    await syncMissing(miss)
      .then(() => {
        thisMissing.splice(thisMissing.indexOf(miss), 1);
      })
      .catch(e => {
        con.error('Error', e);
        miss.error = e;
      });
  }
}

export async function syncListItem(item) {
  for (let i = 0; i < item.slaves.length; i++) {
    const slave = item.slaves[i];
    con.log('sync list item', slave);
    await syncItem(slave, getType(slave.url));
  }
}

export async function syncMissing(item) {
  item.diff = {
    watchedEp: item.watchedEp,
    status: item.status,
    score: item.score,
  };
  return syncItem(item, item.syncType);
}

// eslint-disable-next-line consistent-return
export function syncItem(slave, pageType) {
  if (Object.keys(slave.diff).length !== 0) {
    let singleClass: any;
    if (pageType === 'MAL') {
      singleClass = new MalSingle(slave.url);
    } else if (pageType === 'ANILIST') {
      singleClass = new AniListSingle(slave.url);
    } else if (pageType === 'KITSU') {
      singleClass = new KitsuSingle(slave.url);
    } else if (pageType === 'SIMKL') {
      singleClass = new SimklSingle(slave.url);
    } else {
      throw 'No sync type';
    }

    return singleClass
      .update()
      .then(() => {
        if (typeof slave.diff.watchedEp !== 'undefined') singleClass.setEpisode(slave.diff.watchedEp);
        if (typeof slave.diff.status !== 'undefined') singleClass.setStatus(slave.diff.status);
        if (typeof slave.diff.score !== 'undefined') singleClass.setScore(slave.diff.score);
        return singleClass.sync();
      })
      .then(() => {
        return new Promise(resolve => setTimeout(resolve, 3000));
      })
      .catch(e => {
        return new Promise((resolve, reject) => setTimeout(() => reject(e), 3000));
      });
  }
}

// retrive lists
export async function retriveLists(
  providerList: {
    providerType: string;
    providerSettings: any;
    listProvider: any;
  }[],
  type,
  getListF,
) {
  const typeArray: any = [];

  // @ts-ignore
  const masterMode = getSyncMode(type);
  if (masterMode === 'MALAPI') throw 'Sync with the mal api is not yet supported';

  const listP: any = [];

  providerList.forEach(pi => {
    pi.providerSettings.text = 'Loading';
    // @ts-ignore
    listP.push(
      getListF(pi.listProvider, type)
        .then((list: any) => {
          pi.providerSettings.list = list;
          pi.providerSettings.text = 'Done';
          if (masterMode === pi.providerType) pi.providerSettings.master = true;
          typeArray.push(pi.providerType);
        })
        .catch(e => {
          pi.providerSettings.text = e;
        }),
    );
  });

  await Promise.all(listP);

  let master = false;
  const slaves: any = [];

  providerList.forEach(function(pi) {
    if (pi.providerSettings.master) {
      master = pi.providerSettings.list;
    } else if (pi.providerSettings.list !== null) slaves.push(pi.providerSettings.list);
  });

  return {
    master,
    slaves,
    typeArray,
  };
}

export function getListProvider(providerSettingList) {
  return [
    {
      providerType: 'MAL',
      providerSettings: providerSettingList.mal,
      listProvider: MalList,
    },
    {
      providerType: 'ANILIST',
      providerSettings: providerSettingList.anilist,
      listProvider: AnilistList,
    },
    {
      providerType: 'KITSU',
      providerSettings: providerSettingList.kitsu,
      listProvider: KitsuList,
    },
    {
      providerType: 'SIMKL',
      providerSettings: providerSettingList.simkl,
      listProvider: SimklList,
    },
  ];
}

export function getList(Prov, type) {
  const listProvider = new Prov(7, type);

  return listProvider
    .getCompleteList()
    .then(list => {
      return list;
    })
    .catch(e => {
      con.m(listProvider.name).error(e);
      throw listProvider.errorMessage(e);
    });
}

export const background = {
  async isEnabled() {
    return api.storage.get('backgroundListSync').then(async function(state) {
      con.info('background list sync state', state);
      if (state && state.mode === (await api.settings.getAsync('syncMode'))) return true;
      background.disable();
      return false;
    });
  },
  async enable() {
    return api.storage.set('backgroundListSync', {
      mode: await api.settings.getAsync('syncMode'),
    });
  },
  disable() {
    return api.storage.remove('backgroundListSync');
  },
  async sync() {
    if (await background.isEnabled()) {
      con.log('Start Background list Sync');
      setBadgeText('♻');

      return syncLists('anime')
        .then(() => {
          return syncLists('manga');
        })
        .then(() => {
          setBadgeText('');
        })
        .catch(e => {
          con.error(e);
          setBadgeText('');
        });
    }
    con.error('Background list Sync not allowed');
    return [];

    async function syncLists(type) {
      const mode = 'mirror';
      const list = {};
      const missing = [];

      const providerList = getListProvider({
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

      const listOptions: any = await retriveLists(providerList, type, getList);

      generateSync(listOptions.master, listOptions.slaves, mode, listOptions.typeArray, list, missing);
      con.log('Start syncing', list, missing);
      await syncList(list, missing);
    }
  },
};

function setBadgeText(text: string) {
  // @ts-ignore
  if (api.type === 'userscript') return;
  try {
    chrome.browserAction.setBadgeText({ text });
  } catch (e) {
    con.error(e);
  }
}
