import * as Sync from '../minimal/minimalApp/listSync/syncHandler';

export function listSyncInit(){

  chrome.alarms.get("listSync", async function(a) {
    if(typeof a === 'undefined'){

      var listSync = await api.storage.get("listSync");
      if(typeof listSync === 'undefined' || !parseInt(listSync) || parseInt(listSync) < Date.now()){
        listSync = Date.now() + 1000;
      }
      con.log('Create listSync Alarm', listSync);
      chrome.alarms.create("listSync", {
        periodInMinutes: 2,
        when: parseInt(listSync)
      });

    }else{
      con.log(a);
    }
  });

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "listSync") {
      api.settings.init().then(async ()=>{
        console.groupCollapsed('listSync');
          await Sync.background.sync();
        console.groupEnd();
      });
    }
  });
}
