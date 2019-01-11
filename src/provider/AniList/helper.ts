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
  return '';
}
