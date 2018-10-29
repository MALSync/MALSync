/*TODO: Manga*/

export function checkInit(){
  chrome.alarms.get("updateCheck", function(a) {
    if(typeof a === 'undefined'){
      con.log('Create updateCheck Alarm');
      chrome.alarms.create("updateCheck", {
        periodInMinutes: 60 * 24
      });
      startCheck();
    }else{
      con.log(a);
    }
  });

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "updateCheck") {
      startCheck()
    }
  });
}

export function checkContinue(message){
  var id = message.id;
  con.log('Iframe update check done', id);
  removeIframes();

  if(continueCheck[id]){
    continueCheck[id](message.epList);
    delete continueCheck[id];
  }
}

var continueCheck = {};

function startCheck(){
  con.log('startCheck');
  continueCheck = {};
  chrome.alarms.getAll(function(alarms){
    utils.getUserList(1, 'anime', null, null, async function(list){
      con.log('list', list)
      for (var i = 0; i < list.length; i++) {
        con.log('el', list[i])
        await updateElement(list[i]);
      }
      removeIframes();
    });
  })
}

async function updateElement(el, type = "anime"){
  return new Promise(async (resolve, reject) => {
    var id = Math.random().toString(36).substr(2, 9);
    con.log(utils.getUrlFromTags(el['tags']));
    var streamUrl = utils.getUrlFromTags(el['tags']);
    if(typeof streamUrl != 'undefined'){
      var elCache = await api.storage.get('updateCheck/'+type+'/'+el['anime_id']);
      con.log('cached', elCache);
      if(typeof elCache != 'undefined' && elCache.finished){
        resolve()
        return;
      }

      //Remove other iframes
      removeIframes();
      //Create iframe
      var ifrm = document.createElement("iframe");
      ifrm.setAttribute("src", streamUrl + (streamUrl.split('?')[1] ? '&':'?') + 'mal-sync-background=' + id );
      ifrm.setAttribute("sandbox", 'allow-scripts allow-same-origin');
      document.body.appendChild(ifrm);
      var timeout = setTimeout(function(){
        resolve();
      },60000);
      continueCheck[id] = function(list){
        clearTimeout(timeout);
        con.error(list);
        if (typeof list !== 'undefined' && list.length > 0) {
          var newestEpisode = list.length - 1;
          var newestEpisodeUrl = list[newestEpisode];
          con.log('Episode list found',{
            newestEpisode: newestEpisode,
            newestEpisodeUrl: newestEpisodeUrl
          });

          var finished = false;
          if(newestEpisode >= parseInt(el['anime_num_episodes']) && parseInt(el['anime_num_episodes']) != 0){
            con.log('Finished');
            finished = true;
          }

          api.storage.set('updateCheck/'+type+'/'+el['anime_id'], {newestEp: newestEpisode, finished: finished});

          if(typeof elCache != 'undefined' && newestEpisode > elCache.newestEp){
            con.log('new Episode')
            chrome.notifications.create(
              streamUrl,
              {
                type: 'basic',
                iconUrl: el['anime_image_path'],
                title: el['anime_title'],
                message: 'Episode '+newestEpisode+' released',
             }
            );
          }else{
            con.log('No new episode')
          }

        }else{
          con.error('Episode list empty')
        }
        resolve();
      }
    }else{
      resolve();
    }
  });
}

function removeIframes(){
  var iframes = document.querySelectorAll('iframe');
  for (var i = 0; i < iframes.length; i++) {
      iframes[i].parentNode!.removeChild(iframes[i]);
  }
}
