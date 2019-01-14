export function translateList(aniStatus, malStatus:null|number = null){
  var list = {
    'CURRENT': 1,
    'PLANNING': 6,
    'COMPLETED': 2,
    'DROPPED': 4,
    'PAUSED': 3,
    'REPEATING': 1,
  }
  if(malStatus != null){
    return Object.keys(list).find(key => list[key] === malStatus);
  }
  return list[aniStatus];
}

export function accessToken(){
  return api.settings.get('anilistToken');
}

export function errorHandling(res){
  if(typeof res.errors != 'undefined'){
    res.errors.forEach( (error) => {
      switch(error.status) {
        case 400:
          utils.flashm('Please Authenticate <a target="_blank" href="https://anilist.co/api/v2/oauth/authorize?client_id=1487&response_type=token">Here</a>', {error: true});
          break;
        case 404:
          utils.flashm('anilist: '+error.message, {error: true});
          break;
        default:
          utils.flashm('anilist: '+error.message, {error: true});
          throw error.message;
      }
    })
  }
}

export function aniListToMal(anilistId: number, type: "anime"|"manga"){
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
    id: anilistId,
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
