import {data} from "./data";

export function translateList(simklStatus, malStatus:null|number = null){
  var list = {
    'watching': 1,
    'plantowatch': 6,
    'completed': 2,
    'notinteresting': 4,
    'hold': 3,
  }
  if(malStatus != null){
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[simklStatus];
}

export function getCacheKey(id, simklId){
  if(isNaN(id) || !id){
    return 'simkl:'+simklId;
  }
  return id;
}

export function getEpisode(episode: string):number{
  if(episode){
    var temp = episode.match(/e\d+/i);
    if(temp !== null){
      var episodePart = parseInt(temp[0].replace(/\D/, ''));
      if( isNaN(episodePart) ) return 0;
      return episodePart;
    }
  }
  return 0;
}

export async function syncList(){
  var lastCheck = await api.storage.get('simklLastCheck');
  var activity = await call('https://api.simkl.com/sync/activities');
  con.log('Activity', lastCheck, activity.anime);

  var cacheList = await api.storage.get('simklList');

  //removed_from_list
  if(lastCheck && (lastCheck.removed_from_list !== activity.anime.removed_from_list)){
    alert('removed');
    var checkRemoveList = await call('https://api.simkl.com/sync/all-items/anime');
    var newCacheList = {};
    if(checkRemoveList){
      for (var i = 0; i < checkRemoveList.anime.length; i++) {
        const el = checkRemoveList.anime[i];
        if(cacheList[el.show.ids.simkl] != undefined){
          newCacheList[el.show.ids.simkl] = cacheList[el.show.ids.simkl];
        }
      }
    }
    cacheList = newCacheList;
    con.log('remove', cacheList);
  }

  //Check if update Needed
  var dateFrom = '';
  if(lastCheck && cacheList){
    dateFrom = 'date_from='+lastCheck.all;
    if(lastCheck.all === activity.anime.all){
      con.log('Up to date');
      return cacheList;
    }
  }

  if(!cacheList) cacheList = {};

  if(lastCheck && (lastCheck.rated_at !== activity.anime.rated_at)){
    var rated = await call('https://api.simkl.com/sync/ratings/anime?'+dateFrom);
    con.log('ratedUpdate', rated);
    if(rated){
      for (var i = 0; i < rated.anime.length; i++) {
        const el = rated.anime[i];
        cacheList[el.show.ids.simkl] = el;
      }
    }
  }

  var list = await call('https://api.simkl.com/sync/all-items/anime?'+dateFrom);
  con.log('listUpdate', list);
  if(list){
    for (var i = 0; i < list.anime.length; i++) {
      const el = list.anime[i];
      cacheList[el.show.ids.simkl] = el;
    }
  }
  con.log('totalList', cacheList);
  await api.storage.set('simklList', cacheList);
  await api.storage.set('simklLastCheck', activity.anime);
  return cacheList;
}

export async function getSingle(ids:{simkl?:string|number, mal?:string|number}){
  var list = await syncList();
  if(ids.simkl){
    if(list[ids.simkl] != undefined){
      return list[ids.simkl];
    }
  }else if(ids.mal){
    //TODO: Use map for better performance
    var listVal = Object.values(list);
    for (var i = 0; i < listVal.length; i++) {
      var el:any = listVal[i];
      if(typeof el.show.ids.mal !== 'undefined' && el.show.ids.mal == ids.mal){
        return el;
      }
    }
  }else{
    throw 'No id passed';
  }
  return null;
}

export async function call(url, sData = {}, asParameter = false){
  if(asParameter){
    url += '?'+j.$.param(sData);
  }
  con.log('call', url, sData);
  return api.request.xhr('GET', {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + data.access_token,
      'simkl-api-key': data.client_id,
      'Accept': 'application/vnd.api+json',
    },
    data: sData,
  }).then(async (response) => {
    try{
      return JSON.parse(response.responseText);
    }catch(e){
      con.error(response);
      throw e;
    }

  });
}
