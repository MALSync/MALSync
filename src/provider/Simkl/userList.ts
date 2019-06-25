import {syncList, getCacheKey} from "./helper";
import {listElement} from "./../listInterface";

//Status: 1 = watching | 2 = completed | 3 = onhold | 4 = dropped | 6 = plan to watch | 7 = all
export async function userList(status = 1, localListType = 'anime', callbacks, username: null|string = null, offset = 0, templist: listElement[] = []){
    status = parseInt(status.toString());
    con.log('[UserList][Kitsu]', 'user: '+username, 'status: '+status, 'offset: '+offset);

    return syncList()
    .then((list) => {
      var data = prepareData(Object.values(list), localListType);
      con.error(data);

      if(typeof callbacks.singleCallback !== 'undefined'){
        // @ts-ignore
        if(!data.length) callbacks.singleCallback(false, 0, 0);
        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          callbacks.singleCallback(data[i], i+offset+1, data.length+offset);
        }
      }
      if(typeof callbacks.fullListCallback !== 'undefined'){
        // @ts-ignore
        templist = templist.concat(data);
      }
      //TODO:if(res.meta.count > (offset + 50)){
      if(false){
        if(typeof callbacks.continueCall !== 'undefined'){
          // @ts-ignore
          callbacks.continueCall(function(){
            userList(status, localListType, callbacks, username, offset + 50, templist);
          });
        }else{
          userList(status, localListType, callbacks, username, offset + 50, templist);
        }
      }else{
        // @ts-ignore
        if(typeof callbacks.fullListCallback !== 'undefined') callbacks.fullListCallback(templist);
        // @ts-ignore
        if(typeof callbacks.finishCallback !== 'undefined') callbacks.finishCallback();
      }
    });
}

export function prepareData(data, listType): listElement[]{
  var newData = [] as listElement[];
  for (var i = 0; i < data.length; i++) {
    var el = data[i];
    con.log(el)

    if(listType === "anime"){
      var tempData = {
        malId: el.show.ids.mal,
        uid: el.show.ids.simkl,
        cacheKey: getCacheKey(el.show.ids.mal, el.show.ids.simkl),
        type: listType,
        title: el.show.title,
        url: 'https://simkl.com/'+listType+'/'+el.show.ids.simkl,
        watchedEp: el.last_watched,
        totalEp: 22,
        status: el.status,
        score: el.user_rating,
        image: "https://cdn.myanimelist.net/r/96x136/images/anime/5/65187.webp",
        tags: "list.attributes.notes",
        airingState: el['anime_airing_status'],
      }
      newData.push(tempData);
    }/*else{
      var tempData = {
        malId: malId,
        uid: el.id,
        cacheKey: helper.getCacheKey(malId, el.id),
        kitsuSlug: el.attributes.slug,
        type: listType,
        title: name,
        url: 'https://kitsu.io/'+listType+'/'+el.attributes.slug,
        watchedEp: list.attributes.progress,
        totalEp: el.attributes.chapterCount,
        status: helper.translateList(list.attributes.status),
        score: list.attributes.ratingTwenty/2,
        image: el.attributes.posterImage.large,
        tags: list.attributes.notes,
        airingState: el['anime_airing_status'],
      }
    }*/


  }
  return newData;
}
