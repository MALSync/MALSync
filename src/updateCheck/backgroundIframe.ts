import {Mutex} from 'async-mutex';
import * as provider from "./../provider/provider.ts";

declare var browser: any;
export function checkInit(){
  chrome.alarms.get("updateCheck", function(a) {
    if(typeof a === 'undefined'){
    }else{
      con.log(a);
    }
  });

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "updateCheck" || alarm.name === "updateCheckNow") {
      api.settings.init().then(()=>{
        startCheck('anime');
        startCheck('manga');
      });
    }
  });
}

var retry = false;

export function checkContinue(message){
  if(message.id === 'retry'){
    retry = true;
    con.log('Retry recived');
    return;
  }

  var id = message.id;
  con.log('Iframe update check done', id);
  removeIframes();

  if(continueCheck[id]){
    continueCheck[id](message.epList);
    delete continueCheck[id];
  }
}

var continueCheck = {};
var hiddenTabs:any = [];
var mutex = new Mutex();

async function startCheck(type = "anime"){
  const release = await mutex.acquire();

  con.log('startCheck', type);
  con.log('hideTab', utils.canHideTabs());
  setBadgeText('⟲');

  var mutexTimout = setTimeout(() => {
    setBadgeText('');
    release();
  }, 30 * 60 * 1000)

  continueCheck = {};

  provider.userList(1, type, {fullListCallback: async function(list){
    con.log('list', list)
    for (var i = 0; i < list.length; i++) {
      con.log('el', list[i])
      await updateElement(list[i], type);
    }
    removeIframes();
    api.storage.set( 'updateCheckLast', Date.now() );
    setBadgeText('');
    release();
    clearTimeout(mutexTimout);
  }});


}

async function updateElement(el, type = "anime", retryNum = 0){
  return new Promise(async (resolve, reject) => {
    var anime_id = el.id;
    var anime_num_episodes = el.totalEp;
    var anime_image_path = el.image;
    var anime_title = el.title;
    var num_watched_episodes = el.watchedEp;

    var id = Math.random().toString(36).substr(2, 9);
    con.log(utils.getUrlFromTags(el.tags));
    var streamUrl = utils.getUrlFromTags(el.tags);
    if(typeof streamUrl != 'undefined'){
      var elCache = await api.storage.get('updateCheck/'+type+'/'+anime_id);
      con.log('cached', elCache);
      if(typeof elCache != 'undefined' && elCache.finished){
        resolve()
        return;
      }

      //Remove other iframes
      removeIframes();
      //Create iframe
      openInvisiblePage(streamUrl, id);

      var timeout = setTimeout(async function(){
        api.storage.set('updateCheck/'+type+'/'+anime_id, checkError(elCache, 'Timeout'));
        if(retry && retryNum < 3){
          con.log('retry', retryNum);
          retry = false;
          retryNum++;
          await updateElement(el, type, retryNum)
        }
        resolve();
      },60000);
      continueCheck[id] = async function(list){
        clearTimeout(timeout);
        if (typeof list !== 'undefined' && list.length > 0) {
          var newestEpisode = list.length - 1;
          var newestEpisodeUrl = list[newestEpisode];
          con.log('Episode list found',{
            newestEpisode: newestEpisode,
            newestEpisodeUrl: newestEpisodeUrl
          });

          var finished = false;
          if(newestEpisode >= parseInt(anime_num_episodes) && parseInt(anime_num_episodes) != 0){
            con.log('Finished');
            finished = true;
          }

          api.storage.set('updateCheck/'+type+'/'+anime_id, {newestEp: newestEpisode, finished: finished});

          if(typeof elCache != 'undefined' && newestEpisode > elCache.newestEp && elCache.newestEp != ''){
            con.log('new Episode');
            api.settings.init().then(()=>{
              if(api.settings.get('updateCheckNotifications')){

                var EpisodeText = 'Episode ';
                if(type == 'manga'){
                  EpisodeText = 'Chapter ';
                }

                utils.notifications(
                  streamUrl,
                  anime_title,
                  EpisodeText+newestEpisode,
                  anime_image_path
                );
              }
            })

          }else{
            con.log('No new episode')
          }

          //Update next Episode link
          var continueUrlObj = await utils.getContinueWaching(type, anime_id);
          var nextUserEp = parseInt(num_watched_episodes)+1;

          con.log('Continue', continueUrlObj);
          if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === nextUserEp){
            con.log('Continue link up to date');
          }else{
            con.log('Update continue link');
            var nextUserEpUrl = list[nextUserEp];
            if(typeof nextUserEpUrl != 'undefined'){
              con.log('set continue link', nextUserEpUrl, nextUserEp);
              utils.setContinueWaching(nextUserEpUrl, nextUserEp, type, anime_id);
            }
          }

        }else{
          con.log(checkError(elCache, 'Episode list empty'));
          api.storage.set('updateCheck/'+type+'/'+anime_id, checkError(elCache, 'Episode list empty'));
          con.error('Episode list empty')
        }
        resolve();
      }
    }else{
      resolve();
    }
  });
}

function checkError(elCache, error){
  if(typeof elCache == 'undefined'){
    elCache = {newestEp: '', finished: false}
  }
  elCache['error'] = error;
  return elCache;
}

function openInvisiblePage(url:string, id){
  var url = (url + (url.split('?')[1] ? '&':'?') + 'mal-sync-background=' + id);
  if(utils.canHideTabs()){
    //Firefox
    browser.tabs.create({
      url: url,
      active: false,
    }).then((tab) => {
      hiddenTabs.push(tab.id);
      browser.tabs.hide(tab.id);
    });
  }else{
    //Chrome
    var ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", url);
    ifrm.setAttribute("sandbox", 'allow-scripts allow-same-origin allow-forms');
    document.body.appendChild(ifrm);
  }
}

function removeIframes(){
  if(utils.canHideTabs()){
    //Firefox
    if(hiddenTabs.length){
      for (var i = 0; i < hiddenTabs.length; i++) {
        chrome.tabs.remove(hiddenTabs[i]);
      }
    }
    hiddenTabs = [];
  }else{
    //Chrome
    var iframes = document.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].parentNode!.removeChild(iframes[i]);
    }
  }

}

function setBadgeText(text:string){
  try{
    chrome.browserAction.setBadgeText({text: text});
  }catch(e){
    con.error(e);
  }
}
