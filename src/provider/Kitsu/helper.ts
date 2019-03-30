import {kitsu} from "./templates";

export function translateList(aniStatus, malStatus:null|number = null){
  var list = {
    'current': 1,
    'planned': 6,
    'completed': 2,
    'dropped': 4,
    'on_hold': 3,
  }
  if(malStatus != null){
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[aniStatus];
}

export function accessToken(){
  return api.settings.get('kitsuToken');
}

export function errorHandling(res, silent:boolean = false){
  if(typeof res.errors != 'undefined'){
    res.errors.forEach( (error) => {
      switch(parseInt(error.code)) {
        case 403:
          if(!silent) utils.flashm(kitsu.noLogin, {error: true});
          throw error.message;
          break;
        case 404:
          if(!silent) utils.flashm('kitsu: '+error.detail, {error: true});
          break;
        default:
          if(!silent) utils.flashm('kitsu: '+error.detail, {error: true});
          throw error.message;
      }
    })
  }
}

export function malToKitsu(malid: number, type: "anime"|"manga"){
  return api.request.xhr('Get', {
    url: 'https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/'+type+'&filter[externalId]='+malid+'&include=item&fields[item]=id',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    }
  }).then((response) => {
    var res = JSON.parse(response.responseText);
    return res;
  });
}

export function kitsuSlugtoKitsu(kitsuSlug: string, type: "anime"|"manga"){
  return api.request.xhr('Get', {
    url: 'https://kitsu.io/api/edge/'+type+'?filter[slug]='+kitsuSlug+'&page[limit]=1&include=mappings',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    }
  }).then((response) => {
    var res = JSON.parse(response.responseText);
    var malId = NaN;
    for (var k = 0; k < res.included.length; k++) {
      var mapping = res.included[k];
      if(mapping.type == 'mappings'){
        if(mapping.attributes.externalSite === 'myanimelist/'+type){
          malId = mapping.attributes.externalId;
          res.included.splice(k, 1);
          break;
        }
      }
    }
    return {res: res, malId: malId};
  });
}

export async function userId(){
  var userId = await api.storage.get('kitsuUserId');
  if(typeof userId !== 'undefined'){
    return userId;
  }else{
    return api.request.xhr('Get', {
      url: 'https://kitsu.io/api/edge/users?filter[self]=true',
      headers: {
        'Authorization': 'Bearer ' + accessToken(),
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      }
    }).then((response) => {
      var res = JSON.parse(response.responseText);
      con.log(res);
      if(!res.data.length || res.data[0] == 'undefined'){
        utils.flashm(kitsu.noLogin, {error: true});
        throw('Not authentificated');
      }
      api.storage.set('kitsuUserId', res.data[0].id);
      return res.data[0].id;
    });
  }
}
