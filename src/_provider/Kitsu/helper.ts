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

export function getTitle(titles){
  var title = titles.en;
  if(typeof title == 'undefined' || !title) title = titles.en_jp;
  if(typeof title == 'undefined' || !title) title = titles.ja_jp;
  if(typeof title == 'undefined' || !title){
    var keys = Object.keys(titles);
    if(!keys.length){
      return 'No Title';
    }
    title = titles[keys[0]];
  }
  return title;
}

export function getCacheKey(id, kitsuId){
  if(isNaN(id) || !id){
    return 'kitsu:'+kitsuId;
  }
  return id;
}
