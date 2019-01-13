import * as helper from "./helper";

//Status: 1 = watching | 2 = completed | 3 = onhold | 4 = dropped | 6 = plan to watch | 7 = all
export function userList(status = 1, localListType = 'anime', callbacks, username: null|string = null, offset = 0, templist = []){
    if(offset < 1) offset = 1;
    con.log('[UserList][AniList]', 'username: '+username, 'status: '+status, 'offset: '+offset);
    username = 'lolamtisch';
    if(username == null){
        UserName(function(usernameTemp){
            if(usernameTemp == false){
                utils.flashm( "Please log in on <a target='_blank' href='https://myanimelist.net/login.php'>MyAnimeList!<a>" );
                // @ts-ignore
                if(typeof callbacks.fullListCallback !== 'undefined') callbacks.fullListCallback([]);
                // @ts-ignore
                if(typeof callbacks.finishCallback !== 'undefined') callbacks.finishCallback();
            }else{
                userList(status, localListType, callbacks, usernameTemp, offset, templist);
            }
        });
        return;
    }

    var query = `
    query ($page: Int, $userName: String, $type: MediaType, $status: MediaListStatus) {
      Page (page: $page, perPage: 3) {
        pageInfo {
          hasNextPage
        }
        mediaList (status: $status, type: $type, userName: $userName) {
          status
          progress
          progressVolumes
          notes
          media {
            id
            idMal
            episodes
            chapters
            volumes
            averageScore
            coverImage{
              large
            }
            title {
              userPreferred
            }
          }
        }
      }
    }
    `;
    ​
    var variables = {
      page: offset,
      userName: username,
      type: localListType.toUpperCase(),
      status: helper.translateList(status, status)
    };

    api.request.xhr('POST', {
      url: 'https://graphql.anilist.co',
      headers: {
        'Authorization': 'Bearer ' + helper.accessToken(),
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
      helper.errorHandling(res);
      var data = res.data.Page.mediaList;
      data = prepareData(data, localListType);
      if(typeof callbacks.singleCallback !== 'undefined'){
        // @ts-ignore
        if(!data.length) callbacks.singleCallback(false, 0, 0);
        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          callbacks.singleCallback(data[i], i+offset+1, data.length+offset);
        }
      }
      if(typeof callbacks.fullListCallback !== 'undefined'){
          templist = templist.concat(data);
      }
      if(res.data.Page.pageInfo.hasNextPage){
        if(typeof callbacks.continueCall !== 'undefined'){
          // @ts-ignore
          callbacks.continueCall(function(){
            userList(status, localListType, callbacks, username, offset + 1, templist);
          });
        }else{
          userList(status, localListType, callbacks, username, offset + 1, templist);
        }
      }else{
        // @ts-ignore
        if(typeof callbacks.fullListCallback !== 'undefined') callbacks.fullListCallback(templist);
        // @ts-ignore
        if(typeof callbacks.finishCallback !== 'undefined') callbacks.finishCallback();
      }

    });
}

export interface listElement {
  id: number,
  type: "anime"|"manga"
  title: string,
  url: string,
  watchedEp: number,
  totalEp: number,
  image: string,
  tags: string,
  airingState: number,
}

export function prepareData(data, listType): listElement[]{
  var newData = [] as listElement[];
  for (var i = 0; i < data.length; i++) {
    var el = data[i];
    if(listType === "anime"){
      newData.push({
        id: el.media.idMal,
        type: listType,
        title: el.media.title.userPreferred,
        url: 'https://myanimelist.net/'+listType+'/'+el.media.idMal+'/'+el.media.title.userPreferred,
        watchedEp: el.progress,
        totalEp: el.media.episodes,
        image: el.media.coverImage.large,
        tags: el.notes,
        airingState: el['anime_airing_status'],
      })
    }else{
      newData.push({
        id: el.media.idMal,
        type: listType,
        title: el.media.title.userPreferred,
        url: 'https://myanimelist.net/'+listType+'/'+el.media.idMal+'/'+el.media.title.userPreferred,
        watchedEp: el.progress,
        totalEp: el.media.chapters,
        image: el.media.coverImage.large,
        tags: el.notes,
        airingState: el['anime_airing_status'],
      })
    }

  }
  return newData;
}

export function UserName(callback){
    var url = 'https://myanimelist.net/editlist.php?hideLayout';
    api.request.xhr('GET', url).then((response) => {
      var username = false;
      try{
        username = response.responseText.split('USER_NAME = "')[1].split('"')[0];
      }catch(e){}
      con.log('[Username]', username);
      callback(username);
    });
}
