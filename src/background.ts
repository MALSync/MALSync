import { xhrResponseI, sendMessageI, responseMessageI } from './api/messageInterface';
import { listSyncInit } from './background/listSync';
import { initSyncTags } from './background/syncTags';
import { initProgressScheduler } from './background/releaseProgress';
import { initCustomDomain, cleanupCustomDomains } from './background/customDomain';
import { sendNotification } from './background/notifications';
import { upgradewWizzards } from './background/upgradeWizzards';
import { initDatabase, databaseRequest } from './background/database';
import { initShark } from './utils/shark';

initShark();

try {
  initSyncTags();
} catch (e) {
  con.error(e);
}

try {
  initCustomDomain();
} catch (e) {
  con.error(e);
}

try {
  initDatabase();
} catch (e) {
  con.error(e);
}

api.request.sendMessage = function (message: sendMessageI) {
  return new Promise((resolve, reject) => {
    messageHandler(message, null, function (response: responseMessageI) {
      resolve(response);
    });
  });
};

chrome.runtime.onInstalled.addListener(async function (details) {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.extension.getURL('install.html') }, function (tab) {
      con.info('Open installPage');
    });
  } else if (details.reason === 'update') {
    await upgradewWizzards(details.previousVersion);
    cleanupCustomDomains();
  }
  chrome.alarms.clearAll();
});

chrome.runtime.onMessage.addListener((message: sendMessageI, sender, sendResponse) => {
  return messageHandler(message, sender, sendResponse);
});

function messageHandler(message: sendMessageI, sender, sendResponse, retry = 0) {
  switch (message.name) {
    case 'xhr': {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          console.log(xhr);
          if (xhr.status === 429 && retry < 4 && !utils.rateLimitExclude.test(xhr.responseURL)) {
            con.error('RATE LIMIT');
            setTimeout(() => {
              messageHandler(message, sender, sendResponse, retry + 1);
              api.storage.set('rateLimit', false);
            }, 30000);
            api.storage.set('rateLimit', true);
            return;
          }
          const responseObj: xhrResponseI = {
            finalUrl: xhr.responseURL,
            responseText: xhr.responseText,
            status: xhr.status,
          };
          sendResponse(responseObj);
        }
      };
      if (typeof message.url === 'object') {
        xhr.open(message.method, message.url.url, true);
        for (const key in message.url.headers) {
          xhr.setRequestHeader(key, message.url.headers[key]);
        }
        if (message.url.url.includes('malsync.moe')) {
          xhr.setRequestHeader('version', api.storage.version());
          xhr.setRequestHeader('type', 'addon');
        }
        xhr.send(message.url.data);
      } else {
        xhr.open(message.method, message.url, true);
        if (message.url.includes('malsync.moe')) {
          xhr.setRequestHeader('version', api.storage.version());
          xhr.setRequestHeader('type', 'addon');
        }
        xhr.send();
      }
      return true;
    }
    case 'videoTime': {
      // @ts-ignore
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'videoTime',
        item: message.item,
        sender,
      });
      return undefined;
    }
    case 'content': {
      // @ts-ignore
      chrome.tabs.sendMessage(sender.tab.id, {
        action: 'content',
        item: message.item,
        sender,
      });
      return undefined;
    }
    case 'videoTimeSet': {
      if (!message.sender?.tab?.id) return undefined;

      chrome.tabs.sendMessage(
        message.sender.tab.id,
        {
          action: 'videoTimeSet',
          time: message.time,
          timeAdd: message.timeAdd,
        },
        { frameId: message.sender.frameId },
      );

      return undefined;
    }
    case 'minimalWindow': {
      api.storage.get('windowId').then(winId => {
        if (typeof winId === 'undefined') winId = 22;
        if (chrome.windows && chrome.windows.update && chrome.windows.create) {
          chrome.windows.update(winId, { focused: true }, function () {
            if (chrome.runtime.lastError) {
              const config: any = {
                url: chrome.runtime.getURL('window.html'),
                type: 'popup',
              };

              if (message.width) {
                config.width = message.width;
              }
              if (message.height) {
                config.height = message.height;
              }
              if (message.left) {
                config.left = message.left;
              }

              chrome.windows.create(config, function (win) {
                api.storage.set('windowId', win!.id);
                sendResponse();
              });
            } else {
              sendResponse();
            }
          });
        } else {
          chrome.tabs.update(winId, { active: true }, function () {
            if (chrome.runtime.lastError) {
              const config: any = {
                url: chrome.runtime.getURL('window.html'),
                active: true,
              };

              chrome.tabs.create(config, function (win) {
                api.storage.set('windowId', win!.id);
                sendResponse();
              });
            }
          });
        }
      });
      return true;
    }
    case 'emitter': {
      chrome.runtime.sendMessage(message);
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          // @ts-ignore
          chrome.tabs.sendMessage(tab.id, message);
        });
      });
      return undefined;
    }
    case 'notification': {
      sendNotification(message.options);
      return undefined;
    }
    case 'database': {
      databaseRequest(message.options.call, message.options.param).then(res => sendResponse(res));
      return true;
    }
    default:
  }
  return undefined;
}

listSyncInit();
initProgressScheduler();

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (info) {
    const headers = info.requestHeaders;
    headers!.forEach(function (header, i) {
      if (header.name.toLowerCase() === 'user-agent') {
        header.value =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36';
      }
    });
    return { requestHeaders: headers };
  },
  {
    urls: ['https://myanimelist.net/*'],
    types: ['xmlhttprequest'],
  },
  ['blocking', 'requestHeaders'],
);

chrome.notifications.onClicked.addListener(function (notificationId) {
  chrome.tabs.create({ url: notificationId });
});

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
