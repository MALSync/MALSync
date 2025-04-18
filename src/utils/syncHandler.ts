import { ListElement, ListAbstract } from '../_provider/listAbstract';
import { Single as MalSingle } from '../_provider/MyAnimeList_hybrid/single';
import { Single as AniListSingle } from '../_provider/AniList/single';
import { Single as KitsuSingle } from '../_provider/Kitsu/single';
import { Single as SimklSingle } from '../_provider/Simkl/single';
import { Single as ShikiSingle } from '../_provider/Shikimori/single';

import { UserList as MalList, UserList } from '../_provider/MyAnimeList_hybrid/list';
import { UserList as AnilistList } from '../_provider/AniList/list';
import { UserList as KitsuList } from '../_provider/Kitsu/list';
import { UserList as SimklList } from '../_provider/Simkl/list';
import { UserList as ShikiList } from '../_provider/Shikimori/list';
import { getSyncMode } from '../_provider/helper';
import { status } from '../_provider/definitions';

export function generateSync(masterList: object, slaveLists: object[], typeArray, list, missing) {
  mapToArray(masterList, list, true);

  for (const i in slaveLists) {
    mapToArray(slaveLists[i], list, false);
  }

  for (const i in list) {
    changeCheck(list[i]);
    missingCheck(list[i], missing, typeArray);
  }
}

export function getType(url) {
  if (utils.isDomainMatching(url, 'anilist.co')) return 'ANILIST';
  if (utils.isDomainMatching(url, 'kitsu.app')) return 'KITSU';
  if (utils.isDomainMatching(url, 'myanimelist.net')) return 'MAL';
  if (utils.isDomainMatching(url, 'simkl.com')) return 'SIMKL';
  if (utils.isDomainMatching(url, 'shikimori.one')) return 'SHIKI';
  throw new Error('Type not found');
}

export function mapToArray(providerList, resultList, masterM = false) {
  for (let i = 0; i < providerList.length; i++) {
    const el = providerList[i];
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

export function shouldCheckDates(item) {
  return ['MAL', 'ANILIST', 'KITSU'].includes(getType(item.url));
}

export function shouldCheckRewatchCount(item) {
  return ['MAL', 'ANILIST', 'KITSU', 'SHIKI'].includes(getType(item.url));
}

export function changeCheck(item) {
  if (item.master && item.master.uid) {
    const checkDates = shouldCheckDates(item.master);
    const checkRewatchCount = shouldCheckRewatchCount(item.master);
    for (let i = 0; i < item.slaves.length; i++) {
      const slave = item.slaves[i];
      if (slave.score !== item.master.score) {
        item.diff = true;
        slave.diff.score = item.master.score;
      }
      if (slave.watchedEp !== item.master.watchedEp) {
        if (item.master.status === status.Completed) {
          if (slave.watchedEp !== slave.totalEp) {
            item.diff = true;
            slave.diff.watchedEp = slave.totalEp;
          }
        } else {
          item.diff = true;
          slave.diff.watchedEp = item.master.watchedEp;
        }
      }
      if (item.master.type === 'manga' && slave.readVol !== item.master.readVol) {
        if (item.master.status === status.Completed) {
          if (slave.readVol !== slave.totalVol) {
            item.diff = true;
            slave.diff.readVol = slave.totalVol;
          }
        } else {
          item.diff = true;
          slave.diff.readVol = item.master.readVol;
        }
      }
      if (slave.status !== item.master.status) {
        item.diff = true;
        slave.diff.status = item.master.status;
      }
      if (checkDates && shouldCheckDates(slave)) {
        if (slave.startDate !== item.master.startDate) {
          item.diff = true;
          slave.diff.startDate = item.master.startDate;
        }
        if (slave.finishDate !== item.master.finishDate) {
          item.diff = true;
          slave.diff.finishDate = item.master.finishDate;
        }
      }
      if (checkRewatchCount && shouldCheckRewatchCount(slave)) {
        if ((slave.rewatchCount ?? 0) !== (item.master.rewatchCount ?? 0)) {
          item.diff = true;
          slave.diff.rewatchCount = item.master.rewatchCount ?? 0;
        }
      }
    }
  }
}

export function missingCheck(item, missing, types) {
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
        const entry = {
          title: item.master.title,
          type: item.master.type,
          syncType: type,
          malId: item.master.malId,
          score: item.master.score,
          watchedEp: item.master.watchedEp,
          status: item.master.status,
          startDate: item.master.startDate,
          finishDate: item.master.finishDate,
          rewatchCount: item.master.rewatchCount,
          url: `https://myanimelist.net/${item.master.type}/${item.master.malId}`,
          error: null,
        } as Partial<ListElement>;
        if (item.master.type === 'manga') {
          entry.readVol = item.master.readVol;
        }
        missing.push(entry);
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
    score: item.score,
    watchedEp: item.watchedEp,
    status: item.status,
    startDate: item.startDate,
    finishDate: item.finishDate,
    rewatchCount: item.rewatchCount,
  };
  if (item.type === 'manga') {
    item.diff.readVol = item.readVol;
  }
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
    } else if (pageType === 'SHIKI') {
      singleClass = new ShikiSingle(slave.url);
    } else {
      throw 'No sync type';
    }
    singleClass.setSyncMethod('listSync');

    return singleClass
      .update()
      .then(() => {
        if (typeof slave.diff.score !== 'undefined') singleClass.setScore(slave.diff.score);
        if (typeof slave.diff.watchedEp !== 'undefined')
          singleClass.setEpisode(slave.diff.watchedEp);
        if (typeof slave.diff.readVol !== 'undefined') singleClass.setVolume(slave.diff.readVol);
        if (typeof slave.diff.status !== 'undefined') singleClass.setStatus(slave.diff.status);
        // 'null' is valid for start/finish date
        if (slave.diff.startDate !== undefined) singleClass.setStartDate(slave.diff.startDate);
        if (slave.diff.finishDate !== undefined) singleClass.setFinishDate(slave.diff.finishDate);
        if (typeof slave.diff.rewatchCount !== 'undefined')
          singleClass.setRewatchCount(slave.diff.rewatchCount);
        return singleClass.sync();
      })
      .then(() => {
        return utils.wait(3000);
      })
      .catch(async e => {
        await utils.wait(3000);
        throw e;
      });
  }
}

// retrieve lists
export async function retrieveLists(
  providerList: {
    providerType: string;
    providerSettings: ProviderSettings;
    listProvider: typeof ListAbstract;
  }[],
  type: string,
  getListF: (listProvider: typeof ListAbstract, type: string) => Promise<ListElement[]>,
) {
  const typeArray: string[] = [];

  const tempMode = getSyncMode(type);
  const masterMode = tempMode === 'MALAPI' ? 'MAL' : tempMode;

  const listP: Promise<void>[] = [];

  providerList.forEach(pi => {
    pi.providerSettings.text = api.storage.lang('Loading');
    listP.push(
      getListF(pi.listProvider, type)
        .then(list => {
          pi.providerSettings.list = list;
          pi.providerSettings.text = api.storage.lang('settings_listsync_provider_done');
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

  providerList.forEach(function (pi) {
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

type ProviderSettings = {
  text: string;
  list: any;
  master: boolean;
};

export function getListProvider(providerSettingList: {
  mal: ProviderSettings;
  anilist: ProviderSettings;
  kitsu: ProviderSettings;
  simkl: ProviderSettings;
  shiki: ProviderSettings;
}) {
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
    {
      providerType: 'SHIKI',
      providerSettings: providerSettingList.shiki,
      listProvider: ShikiList,
    },
  ];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function getList(Prov, type) {
  const listProvider = new Prov(7, type);

  try {
    const list = await listProvider.getCompleteList();
    return list;
  } catch (e) {
    con.m(listProvider.name).error(e);
    throw listProvider.errorMessage(e);
  }
}

export const background = {
  async isEnabled() {
    return api.storage.get('backgroundListSync').then(async function (state) {
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

    async function syncLists(type: string) {
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
        shiki: {
          text: 'Init',
          list: null,
          master: false,
        },
      });

      const listOptions: any = await retrieveLists(providerList, type, getList);

      generateSync(listOptions.master, listOptions.slaves, listOptions.typeArray, list, missing);
      con.log('Start syncing', list, missing);
      await syncList(list, missing);
    }
  },
};

function setBadgeText(text: string) {
  // @ts-ignore
  if (api.type === 'userscript') return;
  try {
    chrome.action.setBadgeText({ text });
  } catch (e) {
    con.error(e);
  }
}
