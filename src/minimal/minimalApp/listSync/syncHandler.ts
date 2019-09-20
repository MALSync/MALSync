import * as mal from "./../../../provider/MyAnimeList/entryClass.ts";
import * as anilist from "./../../../provider/AniList/entryClass.ts";
import * as kitsu from "./../../../provider/Kitsu/entryClass.ts";
import * as simkl from "./../../../provider/Simkl/entryClass.ts";

import * as malUserList from "./../../../provider/MyAnimeList/userList.ts";
import * as anilistUserList from "./../../../provider/AniList/userList.ts";
import * as kitsuUserList from "./../../../provider/Kitsu/userList.ts";
import * as simklUserList from "./../../../provider/Simkl/userList.ts";


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
      var entryClass:any = new mal.entryClass(slave.url, true, true);
    }else if(pageType == 'ANILIST'){
      var entryClass:any = new anilist.entryClass(slave.url, true, true);
    }else if(pageType == 'KITSU'){
      var entryClass:any = new kitsu.entryClass(slave.url, true, true);
    }else if(pageType == 'SIMKL'){
      var entryClass:any = new simkl.entryClass(slave.url, true, true);
    }else{
      throw('No sync type');
    }

    return entryClass.init().then(() => {
      if(typeof slave.diff.watchedEp !== "undefined") entryClass.setEpisode(slave.diff.watchedEp);
      if(typeof slave.diff.status !== "undefined") entryClass.setStatus(slave.diff.status);
      if(typeof slave.diff.score !== "undefined") entryClass.setScore(slave.diff.score);
      return entryClass.sync();
    });
  }
}

// retrive lists
export async function retriveLists(providerList: {providerType: string, providerSettings: any, listProvider: any}[], type){
  var typeArray:any = [];
  //@ts-ignore
  var masterMode = this.api().settings.get('syncMode');
  var listP:any = [];

  providerList.forEach((pi) => {
    pi.providerSettings.text = 'Loading';
    //@ts-ignore
    listP.push( this.getList(pi.listProvider, type).then((list:any) => {
      pi.providerSettings.list = list;
      pi.providerSettings.text = 'Done';
      if(masterMode == pi.providerType) pi.providerSettings.master = true;
      if(list.length) typeArray.push(pi.providerType);
      if(!list.length) pi.providerSettings.text = 'Error';
    }) );
  });

  await Promise.all(listP);

  var master = false;
  var slaves:any = [];

  providerList.forEach(function(pi) {
    if(pi.providerSettings.master){
      master = pi.providerSettings.list;
    }else{
      slaves.push(pi.providerSettings.list);
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
      listProvider: malUserList,
    },
    {
      providerType: 'ANILIST',
      providerSettings: providerSettingList.anilist,
      listProvider: anilistUserList,
    },
    {
      providerType: 'KITSU',
      providerSettings: providerSettingList.kitsu,
      listProvider: kitsuUserList,
    },
    {
      providerType: 'SIMKL',
      providerSettings: providerSettingList.simkl,
      listProvider: simklUserList,
    },
  ];
}

export function getList(prov, type){
  return new Promise((resolve, reject) => {
    prov.userList(7, type, {fullListCallback: async function(list){
      con.log('list', list);
      resolve(list)
    }});
  });
}

export function api(){
  return api;
}
