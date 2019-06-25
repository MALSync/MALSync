import {data} from "./data";

export function getCacheKey(id, simklId){
  if(isNaN(id) || !id){
    return 'simkl:'+simklId;
  }
  return id;
}

export async function syncList(){
  var lastCheck = await api.storage.get('simklLastCheck');
  var activity = await call('https://api.simkl.com/sync/activities');
  con.log('Activity', lastCheck, activity);

  var cacheList = await api.storage.get('simklList');

  //removed_from_list
  if(lastCheck && (lastCheck.removed_from_list !== activity.anime.removed_from_list)){
    alert('removed');
  }

  //Check if update Needed
  var dateFrom = '';
  if(lastCheck && cacheList){
    dateFrom = '&date_from='+lastCheck.all;
    if(lastCheck.all === activity.anime.all){
      con.log('Up to date');
      alert('Up to date');
      return cacheList;
    }
  }

  if(!cacheList) cacheList = {};

  var list = await call('https://api.simkl.com/sync/all-items/anime?extended=full'+dateFrom);
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

async function call(url, sData = {}){
  con.log('call', url);
  return api.request.xhr('GET', {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + data.access_token,
      'simkl-api-key': data.client_id,
      'Accept': 'application/vnd.api+json',
    },
    data: sData,
  }).then(async (response) => {
    return JSON.parse(response.responseText);
  });
}
