import {syncPage} from "./pages/syncPage";
import {myanimelistClass} from "./myanimelist/myanimelistClass";
import {anilistClass} from "./anilist/anilistClass";
import {scheduleUpdate} from "./utils/scheduler";
import {firebaseNotification} from "./utils/firebaseNotification";

function main() {
  if( window.location.href.indexOf("myanimelist.net") > -1 ){
    var mal = new myanimelistClass(window.location.href);
    mal.init();
  }else if(window.location.href.indexOf("anilist.co") > -1 ){
    var anilist = new anilistClass(window.location.href);
  }else{
    var page = new syncPage(window.location.href);
    page.init();
  }
  firebaseNotification();
}

var css = "font-size: 40px; padding-bottom: 3px; color: white; text-shadow: -1px -1px #2e51a2, 1px -1px #2e51a2, -1px 1px #2e51a2, 1px 1px #2e51a2, 2px 2px #2e51a2, 3px 3px #2e51a2;";
console.log("%cMAL-Sync", css, "Version: "+ api.storage.version());

api.settings.init()
  .then(()=>{
    main();
    scheduler();
  });

async function scheduler(){
  var schedule = await api.storage.get('timestampUpdate/release');
  if(typeof schedule === 'undefined' || (j.$.now() - schedule) > 345600000){
    await scheduleUpdate();
    api.storage.set('timestampUpdate/release', j.$.now());
  }
}
