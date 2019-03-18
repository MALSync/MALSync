import {syncPage} from "./../pages/syncPage";
import {firebaseNotification} from "./../utils/firebaseNotification";

function main() {
  if(api.settings.get('userscriptMode')) return;
  var page = new syncPage(window.location.href);
  messagePageListener(page);
  page.init();
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
      page.setVideoTime(msg.item);
    }
  });
}
