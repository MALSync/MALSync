/*
 * TODO:
 * Custom Domains
 * Install and update routines
 * webRequest.onBeforeSendHeaders
 */

import { initDatabase } from '../background/database';
import { listSyncInit } from '../background/listSync';
import { initProgressScheduler } from '../background/releaseProgress';
import { initSyncTags } from '../background/syncTags';

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
