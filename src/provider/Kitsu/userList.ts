import * as helper from "./helper";
import {listElement} from "./../listInterface";

//Status: 1 = watching | 2 = completed | 3 = onhold | 4 = dropped | 6 = plan to watch | 7 = all
export async function userList(status = 1, localListType = 'anime', callbacks, username: null|string = null, offset = 0, templist: listElement[] = []){
    status = parseInt(status.toString());
    var statusPart = '';
    var sorting = '';
    if(status !== 7){
      if(status === 1) sorting = '&sort=-progressed_at';
      var statusTemp = helper.translateList(status, status);
      statusPart = '&filter[status]='+statusTemp;
    }


    try {
      username = await helper.userId()
    } catch(e){
      con.error(e);
      // @ts-ignore
      if(typeof callbacks.fullListCallback !== 'undefined') callbacks.fullListCallback([]);
      // @ts-ignore
      if(typeof callbacks.finishCallback !== 'undefined') callbacks.finishCallback();
      return;
    };

    con.log('[UserList][Kitsu]', 'user: '+username, 'status: '+status, 'offset: '+offset);


    return api.request.xhr('GET', {
      url: 'https://kitsu.io/api/edge/library-entries?filter[user_id]='+username+statusPart+'&filter[kind]='+localListType+'&page[offset]='+offset+'&page[limit]=50'+sorting+'&include='+localListType+','+localListType+'.mappings,'+localListType+'.mappings.item&fields['+localListType+']=slug,titles,averageRating,posterImage,'+(localListType == 'anime'? 'episodeCount': 'chapterCount,volumeCount'),
      headers: {
        'Authorization': 'Bearer ' + helper.accessToken(),
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      data: {},
    }).then((response) => {
      var res = JSON.parse(response.responseText);
      con.log(res);
      helper.errorHandling(res);
      var data = prepareData(res, localListType);
      con.error(data);

      if(typeof callbacks.singleCallback !== 'undefined'){
        // @ts-ignore
        if(!data.length) callbacks.singleCallback(false, 0, 0);
        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          callbacks.singleCallback(data[i], i+offset+1, data.length+offset);
        }
      }

      // @ts-ignore
      templist = templist.concat(data);

      if(res.meta.count > (offset + 50)){
        if(typeof callbacks.continueCall !== 'undefined'){
          // @ts-ignore
          callbacks.continueCall(templist, function(){
            userList(status, localListType, callbacks, username, offset + 50, templist);
          });
        }else{
          userList(status, localListType, callbacks, username, offset + 50, templist);
        }
      }else{
        // @ts-ignore
        if(typeof callbacks.fullListCallback !== 'undefined') callbacks.fullListCallback(templist);
        // @ts-ignore
        if(typeof callbacks.continueCall !== 'undefined') callbacks.continueCall(templist, undefined);
        // @ts-ignore
        if(typeof callbacks.finishCallback !== 'undefined') callbacks.finishCallback();
      }
    });
}

export function prepareData(data, listType): listElement[]{
  var newData = [] as listElement[];
  for (var i = 0; i < data.data.length; i++) {
    var list = data.data[i];
    var el = data.included[i];

    var name =  helper.getTitle(el.attributes.titles);

    var malId = NaN;
    for (var k = 0; k < data.included.length; k++) {
      var mapping = data.included[k];
      if(mapping.type == 'mappings'){
        if(mapping.attributes.externalSite === 'myanimelist/'+listType){
          if(mapping.relationships.item.data.id == el.id){
            malId = mapping.attributes.externalId;
            data.included.splice(k, 1);
            break;
          }
        }
      }
    }

    if(listType === "anime"){
      var tempData = {
        malId: malId,
        uid: el.id,
        cacheKey: helper.getCacheKey(malId, el.id),
        kitsuSlug: el.attributes.slug,
        type: listType,
        title: name,
        url: 'https://kitsu.io/'+listType+'/'+el.attributes.slug,
        watchedEp: list.attributes.progress,
        totalEp: el.attributes.episodeCount,
        status: helper.translateList(list.attributes.status),
        score: list.attributes.ratingTwenty/2,
        image: el.attributes.posterImage.large,
        tags: list.attributes.notes,
        airingState: el['anime_airing_status'],
      }
    }else{
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
    }

    if(tempData.totalEp == null){
      tempData.totalEp = 0;
    }

    newData.push(tempData);
  }
  return newData;
}
