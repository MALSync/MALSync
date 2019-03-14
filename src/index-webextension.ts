import {syncPage} from "./pages/syncPage";
import {myanimelistClass} from "./myanimelist/myanimelistClass";
import {anilistClass} from "./anilist/anilistClass";
import {firebaseNotification} from "./utils/firebaseNotification";
import {getPlayerTime} from "./utils/player";

function main() {
  if(api.settings.get('userscriptMode')) return;
  if( window.location.href.indexOf("myanimelist.net") > -1 ){
    var mal = new myanimelistClass(window.location.href);
    messageMalListener(mal);
    mal.init();
  }else if(window.location.href.indexOf("anilist.co") > -1 ){
    var anilist = new anilistClass(window.location.href);
    messageAniListListener(anilist);
  }else{
    var page = new syncPage(window.location.href);
    messagePageListener(page);
    page.init();
  }
  firebaseNotification();
}

var css = "font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;";
console.log("%cMAL-Sync", css, "Version: "+ api.storage.version());

api.settings.init()
  .then(()=>{
    main();
  });

function messagePageListener(page){
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'TabMalUrl') {
      con.log('TabMalUrl Message', page.malObj.url);
      sendResponse(page.malObj.url);
    }
    if(msg.action == 'videoTime'){
      setVideoTime(msg.item);
    }
  });
}

getPlayerTime(function(item){
  setVideoTime(item);
});

function setVideoTime(item){
  var progress = item.current / item.duration * 100;
  j.$('#testProgressMalSync').css('width', progress+'%');
  j.$('#malSyncProgress').removeClass('ms-loading');
}

function messageMalListener(mal){
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'TabMalUrl') {
      con.log('TabMalUrl Message', mal.url);
      sendResponse(mal.url);
    }
  });
}

function messageAniListListener(anilist){
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'TabMalUrl') {
      anilist.getMalUrl().then((malUrl)=>{
        con.log('TabMalUrl Message', malUrl);
        sendResponse(malUrl);
      })
      return true;
    }
  });
}

//TestingProgressBar
j.$(document).ready(function(){
  j.$('body').after(`
    <div id="malSyncProgress" class="ms-loading" style="background-color: #ddd; position: fixed; bottom: 0; left: 0; right: 0; height: 4px;">
      <div id="testProgressMalSync" style="background-color: #2980b9; width: 0%; height: 100%; transition: width 1s;"></div>
    </div>
  `)
});
