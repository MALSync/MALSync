import {Single as malSingle} from "./../../../_provider/MyAnimeList/single";
import {Single as anilistSingle} from "./../../../_provider/AniList/single";
import {Single as kitsuSingle} from "./../../../_provider/Kitsu/single";
import {Single as simklSingle} from "./../../../_provider/Simkl/single";
import {Single as localSingle} from "./../../../_provider/Local/single";

import {userlist as malList} from "./../../../_provider/MyAnimeList/list";
import {userlist as anilistList} from "./../../../_provider/AniList/list";
import {userlist as kitsuList} from "./../../../_provider/Kitsu/list";
import {userlist as simklList} from "./../../../_provider/Simkl/list";


export function generateSync(masterList: object, slaveLists: object[], mode, typeArray, list, missing){
  mapToArray(masterList, list, true);

  for (var i in slaveLists) {
    mapToArray(slaveLists[i], list, false);
  }

  for (var i in list) {
    changeCheck(list[i], mode);
    missingCheck(list[i], missing, typeArray, mode);
  }
}

export function getType(url){
  if(url.indexOf('anilist.co') !== -1) return 'ANILIST';
  if(url.indexOf('kitsu.io') !== -1) return 'KITSU';
  if(url.indexOf('myanimelist.net') !== -1) return 'MAL';
  if(url.indexOf('simkl.com') !== -1) return 'SIMKL';
  throw 'Type not found';
}

export function mapToArray(provierList, resultList, masterM = false){
  for (var i = 0; i < provierList.length; i++) {
    var el = provierList[i];
    var temp = resultList[el.malId];
    if(typeof temp === "undefined"){
      temp = {
        diff: false,
        master: {},
        slaves: []
      };
    }

    if(masterM){
      temp.master = el;
    }else{
      el.diff = {};
      temp.slaves.push(el);
    }
    if(!isNaN(el.malId) && el.malId){
      resultList[el.malId] = temp;
    }else{
      //TODO: List them
    }

  }
}

export function changeCheck(item, mode){
  if(item.master && item.master.uid){;
    for (var i = 0; i < item.slaves.length; i++) {
      var slave = item.slaves[i];
      if(slave.watchedEp !== item.master.watchedEp){
        if(item.master.status == 2){
          if(slave.watchedEp !== slave.totalEp){
            item.diff = true;
            slave.diff.watchedEp = slave.totalEp;
          }
        }else{
          item.diff = true;
          slave.diff.watchedEp = item.master.watchedEp;
        }
      }
      if(slave.status !== item.master.status){
        item.diff = true;
        slave.diff.status = item.master.status;
      }
      if(slave.score !== item.master.score){
        item.diff = true;
        slave.diff.score = item.master.score;
      }
    }
  }
}

export function missingCheck(item, missing, types, mode){
  if(item.master && item.master.uid){
    var tempTypes:any[] = [];
    tempTypes.push(getType(item.master.url));
    for (var i = 0; i < item.slaves.length; i++) {
      var slave = item.slaves[i];
      tempTypes.push(getType(slave.url));
    }
    for (var t in types) {
      var type = types[t];
      if(!tempTypes.includes(type)){
        missing.push({
          'title': item.master.title,
          'syncType': type,
          'malId': item.master.malId,
          'watchedEp': item.master.watchedEp,
          'score': item.master.score,
          'status': item.master.status,
          'url': 'https://myanimelist.net/'+item.master.type+'/'+item.master.malId,
          'error': null
        })
      }
    }
  }
}

//Sync

export async function syncList(list, thisMissing){
  for (var i in list) {
    var el = list[i];
    if(el.diff){
      try{
        await syncListItem(el);
        el.diff = false;
      }catch(e){
        con.error(e);
      }

    }
  }

  var missing = thisMissing.slice();
  for (var i in missing) {
    var miss = missing[i];
    con.log("Sync missing", miss);
    await syncMissing(miss)
      .then(() => {
        thisMissing.splice(thisMissing.indexOf(miss), 1);
      })
      .catch((e) => {
        con.error('Error', e);
        miss.error = e;
      });
  }
}

export async function syncListItem(item){
  for (var i = 0; i < item.slaves.length; i++) {
    var slave = item.slaves[i];
    con.log('sync list item', slave);
    await syncItem(slave, getType(slave.url));
  }
}

export async function syncMissing(item){
  item.diff = {
    watchedEp: item.watchedEp,
    status: item.status,
    score: item.score
  };
  return syncItem(item, item.syncType);
}

export function syncItem(slave, pageType){
  if(Object.keys(slave.diff).length !== 0){
    if(pageType == 'MAL'){
      var singleClass:any = new malSingle(slave.url);
    }else if(pageType == 'ANILIST'){
      var singleClass:any = new anilistSingle(slave.url);
    }else if(pageType == 'KITSU'){
      var singleClass:any = new kitsuSingle(slave.url);
    }else if(pageType == 'SIMKL'){
      var singleClass:any = new simklSingle(slave.url);
    }else{
      throw('No sync type');
    }

    return singleClass.update().then(() => {
      if(typeof slave.diff.watchedEp !== "undefined") singleClass.setEpisode(slave.diff.watchedEp);
      if(typeof slave.diff.status !== "undefined") singleClass.setStatus(slave.diff.status);
      if(typeof slave.diff.score !== "undefined") singleClass.setScore(slave.diff.score);
      return singleClass.sync();
    });
  }
}

// retrive lists
export async function retriveLists(providerList: {providerType: string, providerSettings: any, listProvider: any}[], type, apiTemp, getListF){
  var typeArray:any = [];

  //@ts-ignore
  var masterMode = apiTemp.settings.get('syncMode');
  var listP:any = [];

  providerList.forEach((pi) => {
    pi.providerSettings.text = 'Loading';
    //@ts-ignore
    listP.push( getListF(pi.listProvider, type).then((list:any) => {
      pi.providerSettings.list = list;
      pi.providerSettings.text = 'Done';
      if(masterMode == pi.providerType) pi.providerSettings.master = true;
      typeArray.push(pi.providerType);
    }).catch((e) => {
      pi.providerSettings.text = e;
    }));
  });

  await Promise.all(listP);

  var master = false;
  var slaves:any = [];

  providerList.forEach(function(pi) {
    if(pi.providerSettings.master){
      master = pi.providerSettings.list;
    }else{
      if(pi.providerSettings.list !== null) slaves.push(pi.providerSettings.list);
    }
  });

  return {
    master: master,
    slaves: slaves,
    typeArray: typeArray
  }
}

export function getListProvider(providerSettingList){
  return [
    {
      providerType: 'MAL',
      providerSettings: providerSettingList.mal,
      listProvider: malList,
    },
    {
      providerType: 'ANILIST',
      providerSettings: providerSettingList.anilist,
      listProvider: anilistList,
    },
    {
      providerType: 'KITSU',
      providerSettings: providerSettingList.kitsu,
      listProvider: kitsuList,
    },
    {
      providerType: 'SIMKL',
      providerSettings: providerSettingList.simkl,
      listProvider: simklList,
    },
  ];
}

export function getList(prov, type){
  var listProvider = new prov(7, type);

  return listProvider.get().then( (list) => {return list;})
  .catch((e) => {
    con.error(e);
    throw listProvider.errorMessage(e);
  })
}

export var background = {
  isEnabled: async function(){
    return api.storage.get('backgroundListSync').then(async function(state){
      con.info('background list sync state', state);
      if(state && state.mode === await api.settings.getAsync('syncMode')) return true;
      background.disable();
      return false;
    });
  },
  enable: async function(){
    return api.storage.set('backgroundListSync', {
      mode: await api.settings.getAsync('syncMode')
    })
  },
  disable: function(){
    return api.storage.remove('backgroundListSync');
  },
  sync: async function(){

    if(await background.isEnabled()) {
      con.log('Start Background list Sync');

      return syncLists('anime').then( () => {
        return syncLists('manga');
      })
    }else{
      con.error('Background list Sync not allowed');
    }


    async function syncLists(type){
      var mode = 'mirror';
      var list = {};
      var missing = [];

      var providerList = getListProvider({
        mal: {
          text: 'Init',
          list: null,
          master: false
        },
        anilist: {
          text: 'Init',
          list: null,
          master: false
        },
        kitsu: {
          text: 'Init',
          list: null,
          master: false
        },
        simkl: {
          text: 'Init',
          list: null,
          master: false
        }
      });

      var listOptions:any = await retriveLists(providerList, type, api, getList)

      generateSync(listOptions.master, listOptions.slaves, mode, listOptions.typeArray, list, missing);
      con.log('Start syncing', list, missing);
      syncList(list, missing);
    }

  }
}
