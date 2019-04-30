import {listElement} from "./../listInterface";

//Status: 1 = watching | 2 = completed | 3 = onhold | 4 = dropped | 6 = plan to watch | 7 = all
export function userList(status = 1, localListType = 'anime', callbacks, username = null, offset = 0, templist = []){
  var data = prepareData([], localListType);
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

export function prepareData(data, listType): listElement[]{
  if(listType === "anime"){
    data = [
      'https://kissanime.ru/Anime/No-Game-No-Life',
      'https://www.crunchyroll.com/no-game-no-life?season=no%20game%20no%20life',
      'https://www4.9anime.to/watch/no-game-no-life.4qkm',
      'https://www.anime4you.one/show/1/aid/781/',
      'https://www2.gogoanime.io/category/no-game-no-life',
      'https://www.netflix.com/title/80052669',
      'https://proxer.me/info/6587/list',
      'https://twist.moe/a/no-game-no-life/1',
      'https://vrv.co/series/G68V1JGD6?season=GYZX2Q546',
      'https://otakustream.tv/anime/no-game-no-life/',
      'https://www.branitube.org/animes/no-game-no-life',
      'http://www.turkanime.tv/anime/no-game-no-life',
      'https://animepahe.com/anime/no-game-no-life',
      'https://animeflv.net/anime/3825/no-game-no-life',
      'https://jkanime.net/no-game-no-life/',
    ];
  }else{
    data = [
      'https://kissmanga.com/Manga/No-Game-No-Life',
      'https://mangadex.org/manga/8173/no-game-no-life',
      'https://mangarock.com/manga/mrs-serie-179306',
      'https://proxer.me/info/8072/list',
    ];
  }
  var newData = [] as listElement[];
  for (var i = 0; i < data.length; i++) {
    var el = data[i];
    if(listType === "anime"){
      newData.push({
        airingState: 2,
        image: "https://cdn.myanimelist.net/r/96x136/images/anime/5/65187.webp?s=5b3e784f01f5acac5cf78158d2e484a8",
        malId: i+1,
        tags: "malSync::"+el+"::",
        title: utils.urlPart(el, 2).split('.').slice(-2, -1)[0],
        totalEp: 12,
        type: "anime",
        uid: i+1,
        url: "https://myanimelist.net/anime/19815/No_Game_No_Life",
        watchedEp: 1,
      });
    }else{
      newData.push({
        airingState: 2,
        image: "https://cdn.myanimelist.net/r/96x136/images/anime/5/65187.webp?s=5b3e784f01f5acac5cf78158d2e484a8",
        malId: i+1,
        tags: "malSync::"+el+"::",
        title: utils.urlPart(el, 2).split('.').slice(-2, -1)[0],
        totalEp: 0,
        type: "manga",
        uid: i+1,
        url: "https://myanimelist.net/manga/48397/No_Game_No_Life",
        watchedEp: 1,
      });
    }
  }
  con.error(newData);
  return newData;

}
