import {listElement} from "./../listInterface";
import * as helper from "./helper";

//Status: 1 = watching | 2 = completed | 3 = onhold | 4 = dropped | 6 = plan to watch | 7 = all
export async function userList(status = 1, localListType = 'anime', callbacks, username = null, offset = 0, templist = []){
  // @ts-ignore
  status = parseInt(status);

  var data = prepareData(await getSyncList(), localListType, status);

  if(typeof callbacks.singleCallback !== 'undefined'){
    // @ts-ignore
    if(!data.length) callbacks.singleCallback(false, 0, 0);
    for (var i = 0; i < data.length; i++) {
      // @ts-ignore
      callbacks.singleCallback(data[i], i+offset+1, data.length+offset);
    }
  }



  // @ts-ignore
  if(typeof callbacks.fullListCallback !== 'undefined') callbacks.fullListCallback(data);
  // @ts-ignore
  if(typeof callbacks.finishCallback !== 'undefined') callbacks.finishCallback();

}

export function prepareData(data, listType, status): listElement[]{
  var newData = [] as listElement[];
  for (var key in data) {
    if(getRegex(listType).test(key)){
      var el = data[key];
      con.log(key, el);
      if(status !== 7 && parseInt(el.status) !== status){
        continue;
      }
      if(listType === "anime"){
        newData.push({
          airingState: 2,
          image: api.storage.assetUrl('questionmark.gif'),
          malId: 0,
          tags: el.tags,
          title: el.name,
          totalEp: 0,
          status: el.status,
          score: el.score,
          type: "anime",
          //@ts-ignore
          uid: key,
          url: key,
          cacheKey: helper.getCacheKey(utils.urlPart(key, 4)),
          watchedEp: el.progress,
        });
      }else{
        newData.push({
          airingState: 2,
          image: api.storage.assetUrl('questionmark.gif'),
          malId: 0,
          tags: el.tags,
          title: el.name,
          totalEp: 0,
          status: el.status,
          score: el.score,
          type: "manga",
          //@ts-ignore
          uid: key,
          url: key,
          cacheKey: helper.getCacheKey(utils.urlPart(key, 4)),
          watchedEp: el.progress,
        });
      }
    }
  }

  con.log('data', newData);
  return newData;
}

export async function exportData(){
  var data = await getSyncList();
  var newData = {};
  for (var key in data) {
    if(getRegex("(anime|manga)").test(key)){
      newData[key] = data[key];
    }
  }
  return newData;
}

export async function importData(newData: {}){
  var data = await getSyncList();

  //Delete old data
  for (var key in data) {
    if(getRegex("(anime|manga)").test(key)){
      con.log('Remove', key);
      api.storage.remove(key);
    }
  }

  //import Data
  for (var k in newData){
    con.log('Set', k, newData[k]);
    api.storage.set(k, newData[k]);
  }

  return 1;
}

//Helper
function getRegex(listType){
  return new RegExp("^local:\/\/[^\/]*\/"+listType, "i");
}

async function getSyncList(){
  if(api.type == 'userscript') {
    var list = await api.storage.list('sync');
    for (var key in list) {
      list[key] = await api.storage.get(key);
    }
    var data = list;
  }else{
    var data = api.storage.list('sync');
  }
  return data;
}
