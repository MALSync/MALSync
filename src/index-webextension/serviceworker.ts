import { initDatabase } from '../background/database';
import { listSyncInit } from '../background/listSync';
import { initProgressScheduler } from '../background/releaseProgress';
import { initSyncTags } from '../background/syncTags';
import { initMessageHandler } from '../background/messageHandler';
import { upgradewWizzards } from '../background/upgradeWizzards';
import { cleanupCustomDomains, initCustomDomain } from '../background/customDomain';

try {
  chrome.runtime.onStartup.addListener(() => con.log('Browser started'));
} catch (e) {
  con.error(e);
}

try {
  initMessageHandler();
} catch (e) {
  con.error(e);
}

try {
  initCustomDomain();
} catch (e) {
  con.error(e);
}

try {
  initSyncTags();
} catch (e) {
  con.error(e);
}

try {
  initDatabase();
} catch (e) {
  con.error(e);
}

try {
  listSyncInit();
} catch (e) {
  con.error(e);
}

try {
  initProgressScheduler();
} catch (e) {
  con.error(e);
}

// Notification actions
chrome.notifications.onClicked.addListener(function (notificationId) {
  chrome.tabs.create({ url: notificationId });
});

// Discord Rich Presence
chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  chrome.tabs.sendMessage(
    request.tab,
    { action: 'presence', data: request.info },
    function (response) {
      sendResponse(response);
    },
  );
  return true;
});

chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('install.html') }, function (tab) {
      con.info('Open installPage');
    });
  } else if (details.reason === 'update') {
    upgradewWizzards(details.previousVersion).finally(() => cleanupCustomDomains());
  }
  chrome.alarms.clearAll();
});
