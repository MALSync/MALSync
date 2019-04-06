import {anilistClass} from "./../anilist/anilistClass";
import {firebaseNotification} from "./../utils/firebaseNotification";

function main() {
  if(api.settings.get('userscriptMode')) return;
  var anilist = new anilistClass(window.location.href);
  messageAniListListener(anilist);
  firebaseNotification();
}

var css = "font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;";
console.log("%cMAL-Sync", css, "Version: "+ api.storage.version());

api.settings.init()
  .then(()=>{
    main();
  });

function messageAniListListener(anilist){
  // @ts-ignore
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'TabMalUrl') {
      anilist.getMalUrl().then((malUrl)=>{
        if(malUrl !== ''){
          con.log('TabMalUrl Message', malUrl);
          sendResponse(malUrl);
        }
      })
      return true;
    }
  });
}
