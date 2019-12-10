export function getCacheKey(id, page){
  return 'local:'+id+':'+page;
}

export async function getSyncList(){
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

export function getRegex(listType){
  return new RegExp("^local:\/\/[^\/]*\/"+listType, "i");
}
