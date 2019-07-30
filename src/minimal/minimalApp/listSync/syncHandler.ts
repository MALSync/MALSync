
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
