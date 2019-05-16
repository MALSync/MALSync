import {listElement} from "./../listInterface";

//Status: 1 = watching | 2 = completed | 3 = onhold | 4 = dropped | 6 = plan to watch | 7 = all
export async function userList(status = 1, localListType = 'anime', callbacks, username = null, offset = 0, templist = []){
  // @ts-ignore
  status = parseInt(status);
  if(api.type == 'userscript') {
    var list = await api.storage.list('sync');
    for (var key in list) {
      list[key] = await api.storage.get(key);
    }
    var data = prepareData(list, localListType, status);
  }else{
    var data = prepareData(await api.storage.list('sync'), localListType, status);
  }

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
    var re = new RegExp("^local:\/\/[^\/]*\/"+listType, "i");
    if(re.test(key)){
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
          type: "anime",
          //@ts-ignore
          uid: key,
          url: key,
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
          type: "manga",
          //@ts-ignore
          uid: key,
          url: key,
          watchedEp: el.progress,
        });
      }
    }
  }

  con.log('data', newData);
  return newData;
}
