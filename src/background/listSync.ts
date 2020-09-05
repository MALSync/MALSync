import * as Sync from '../minimal/minimalApp/listSync/syncHandler';

export function listSyncInit() {
  chrome.alarms.get('listSync', async function(a) {
    const listSyncLast = await api.storage.get('listSyncLast');
    const syncInterval = 23 * 60;

    if (typeof a !== 'undefined' && Date.now() - listSyncLast < syncInterval * 60 * 1000) {
      con.log('listSync already set and on time', listSyncLast, a);
      return;
    }

    if (a) chrome.alarms.clear('listSync');

    con.log('Create listSync Alarm', syncInterval, listSyncLast);
    chrome.alarms.create('listSync', {
      periodInMinutes: syncInterval,
      when: Date.now() + 1000,
    });
  });

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'listSync') {
      api.storage.set('listSyncLast', Date.now());
      api.settings.init().then(async () => {
        console.groupCollapsed('listSync');
        await Sync.background.sync();
        console.groupEnd();
      });
    }
  });
}
