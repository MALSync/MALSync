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
      switch(error.status) {
        case 400:
          if(!silent) utils.flashm('Please Authenticate <a target="_blank" href="https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token">Here</a>', {error: true});
          break;
        case 404:
          if(!silent) utils.flashm('anilist: '+error.message, {error: true});
          break;
        default:
          if(!silent) utils.flashm('anilist: '+error.message, {error: true});
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

export function kitsuToMal(kitsuSlug: string, type: "anime"|"manga"){
  var query = `
  query ($id: Int, $type: MediaType) {
    Media (id: $id, type: $type) {
      id
      idMal
    }
  }
  `;
  ​
  var variables = {
    id: kitsuSlug,
    type: type.toUpperCase()
  };

  return api.request.xhr('POST', {
    url: 'https://graphql.anilist.co',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    data: JSON.stringify({
      query: query,
      variables: variables
    })
  }).then((response) => {
    var res = JSON.parse(response.responseText);
    con.log(res);
    errorHandling(res);
    return res.data.Media.idMal;
  });
}
