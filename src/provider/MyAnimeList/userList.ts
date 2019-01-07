//Status: 1 = watching | 2 = completed | 3 = onhold | 4 = dropped | 6 = plan to watch | 7 = all
export function userList(status = 1, localListType = 'anime', callbacks, username = null, offset = 0, templist = []){
    con.log('[UserList]', 'username: '+username, 'status: '+status, 'offset: '+offset);
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
    var url = 'https://myanimelist.net/'+localListType+'list/'+username+'/load.json?offset='+offset+'&status='+status;
    api.request.xhr('GET', url).then((response) => {
      var data = JSON.parse(response.responseText);
      data = prepareData(data);
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
      if(data.length > 299){
        if(typeof callbacks.continueCall !== 'undefined'){
          // @ts-ignore
          callbacks.continueCall(function(){
            userList(status, localListType, callbacks, username, offset + 300, templist);
          });
        }else{
          userList(status, localListType, callbacks, username, offset + 300, templist);
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
  title: string,
}

function prepareData(data): listElement[]{
  var newData = [] as listElement[];
  for (var i = 0; i < data.length; i++) {
    newData.push({
      title: 'test'
    })
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
