import { xhrResponseI, sendMessageI, responseMessageI } from './api/messageInterface';
import { scheduleUpdate } from './utils/scheduler';
import { checkInit, checkContinue } from './background/backgroundIframe';
import { listSyncInit } from './background/listSync';
import { initSyncTags } from './background/syncTags';

try {
  initSyncTags();
} catch (e) {
  con.error(e);
}

api.request.sendMessage = function(message: sendMessageI) {
  return new Promise((resolve, reject) => {
    messageHandler(message, null, function(response: responseMessageI) {
      resolve(response);
    });
  });
};

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.extension.getURL('install.html') }, function(tab) {
      con.info('Open installPage');
    });
  } else if (details.reason === 'update') {
    if (api.storage.version() === '0.7.8') {
      // Set existing users to tags on.
      api.storage.get('settings/malTags').then(res => {
        if (typeof res === 'undefined') {
          api.storage.set('settings/malTags', true);
        }
      });
    }
  }
  chrome.alarms.clearAll();
});

chrome.runtime.onMessage.addListener((message: sendMessageI, sender, sendResponse) => {
  return messageHandler(message, sender, sendResponse);
});

function messageHandler(message: sendMessageI, sender, sendResponse) {
  switch (message.name) {
    case 'xhr': {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          console.log(xhr);
          if (xhr.status === 429) {
            con.error('RATE LIMIT');
            setTimeout(() => {
              messageHandler(message, sender, sendResponse);
              api.storage.set('rateLimit', false);
            }, 10000);
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
        getCookies(message.url.url, sender, xhr, () => {
          // @ts-ignore
          xhr.send(message.url.data);
        });
      } else {
        xhr.open(message.method, message.url, true);
        getCookies(message.url, sender, xhr, function() {
          xhr.send();
        });
      }
      return true;
    }
    case 'iframeDone': {
      checkContinue(message);
      return undefined;
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
        chrome.windows.update(winId, { focused: true }, function() {
          if (chrome.runtime.lastError) {
            chrome.windows.create(
              {
                url: chrome.runtime.getURL('window.html'),
                type: 'popup',
              },
              function(win) {
                api.storage.set('windowId', win!.id);
                sendResponse();
              },
            );
          } else {
            sendResponse();
          }
        });
      });
      return true;
    }
    default:
  }
  return undefined;
}

function getCookies(url, sender, xhr, callback) {
  chrome.permissions.contains(
    {
      permissions: ['cookies'],
    },
    function(result) {
      // @ts-ignore
      if (!result || typeof browser === 'undefined' || !browser) {
        callback();
        return;
      }

      let cookieId = '';
      if (
        typeof sender !== 'undefined' &&
        sender &&
        typeof sender.tab !== 'undefined' &&
        typeof sender.tab.cookieStoreId !== 'undefined'
      ) {
        cookieId = sender.tab.cookieStoreId;
      }

      if (
        typeof sender !== 'undefined' &&
        sender &&
        typeof sender.envType !== 'undefined' &&
        sender.envType === 'addon_child'
      ) {
        chrome.tabs.query({ currentWindow: true, active: true }, function(tabs) {
          // @ts-ignore
          if (tabs[0] && typeof tabs[0].cookieStoreId !== 'undefined') {
            // @ts-ignore
            cookieId = tabs[0].cookieStoreId;
          }
          t(cookieId);
        });
      } else {
        t(cookieId);
      }

      function t(cookieIdT) {
        if (cookieIdT !== '') {
          // @ts-ignore
          browser.cookies.getAll({ storeId: cookieIdT, url }).then(function(cookies) {
            con.log('Cookie Store', cookieIdT, cookies);
            let cookiesText = '';
            for (const key in cookies) {
              const cookie = cookies[key];
              cookiesText += `${cookie.name}=${cookie.value}; `;
            }
            if (cookiesText !== '') {
              xhr.setRequestHeader('CookieTemp', cookiesText);
              xhr.withCredentials = 'true';
            }

            callback();
          });
          return;
        }

        callback();
      }
    },
  );
}

chrome.alarms.get('schedule', function(a) {
  if (typeof a === 'undefined') {
    con.log('Create schedule Alarm');
    chrome.alarms.create('schedule', {
      periodInMinutes: 60 * 24,
    });
    scheduleUpdate();
  } else {
    con.log(a);
  }
});

chrome.alarms.get('updateCheck', async function(a) {
  if (typeof a === 'undefined') {
    const updateCheckTime = await api.storage.get('updateCheckTime');
    if (typeof updateCheckTime !== 'undefined' && updateCheckTime && updateCheckTime !== '0') {
      let updateCheck = await api.storage.get('updateCheck');
      if (typeof updateCheck === 'undefined' || !parseInt(updateCheck) || parseInt(updateCheck) < Date.now()) {
        updateCheck = Date.now() + 1000;
      }
      con.log('Create updateCheck Alarm', `${updateCheckTime}m`, updateCheck);
      chrome.alarms.create('updateCheck', {
        periodInMinutes: parseInt(updateCheckTime),
        when: parseInt(updateCheck),
      });
    }
  } else {
    con.log(a);
  }
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (typeof alarm.periodInMinutes !== 'undefined') {
    api.storage.set(alarm.name, Date.now() + alarm.periodInMinutes * 1000 * 60);
  }
  if (alarm.name === 'schedule') {
    scheduleUpdate();
  }
});

checkInit();
listSyncInit();

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(info) {
    const headers = info.requestHeaders;
    headers!.forEach(function(header, i) {
      if (header.name.toLowerCase() === 'user-agent') {
        header.value =
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';
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

function webRequestListener() {
  chrome.permissions.contains(
    {
      permissions: ['webRequest'],
    },
    function(result) {
      if (result) {
        con.log('webRequest permissions found');
        chrome.webRequest.onHeadersReceived.addListener(
          // eslint-disable-next-line consistent-return
          function(details) {
            if (details.initiator!.indexOf(chrome.runtime.id) !== -1) {
              con.log('Remove x-frame-options');
              for (let i = 0; i < details.responseHeaders!.length; ++i) {
                if (details.responseHeaders![i].name.toLowerCase() === 'x-frame-options') {
                  details.responseHeaders!.splice(i, 1);
                  return {
                    responseHeaders: details.responseHeaders,
                  };
                }
              }
            }
          },
          {
            urls: ['*://*/*mal-sync-background=*'],
          },
          ['blocking', 'responseHeaders'],
        );
      }
    },
  );

  chrome.permissions.contains(
    {
      permissions: ['webRequest', 'cookies'],
    },
    function(result) {
      if (result) {
        con.log('Cookie permissions found');
        chrome.webRequest.onBeforeSendHeaders.addListener(
          function(details) {
            let tempCookies = '';
            details.requestHeaders!.forEach(function(requestHeader) {
              if (requestHeader.name === 'CookieTemp') {
                tempCookies = requestHeader!.value!;
              }
            });

            if (tempCookies !== '') {
              con.log('Replace Cookies', tempCookies);
              details.requestHeaders!.forEach(function(requestHeader) {
                if (requestHeader.name.toLowerCase() === 'cookie') {
                  requestHeader.value = tempCookies;
                }
              });
            }
            return {
              requestHeaders: details.requestHeaders,
            };
          },
          {
            urls: ['*://myanimelist.net/*'],
          },
          ['blocking', 'requestHeaders'],
        );
      } else {
        con.log('No webRequest permissions');
      }
    },
  );
}

webRequestListener();

chrome.notifications.onClicked.addListener(function(notificationId) {
  chrome.tabs.create({ url: notificationId });
});

try {
  chrome.permissions.onAdded.addListener(function() {
    webRequestListener();
  });
} catch (e) {
  con.info('Permission on change', e);
}

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  chrome.tabs.sendMessage(request.tab, { action: 'presence', data: request.info }, function(response) {
    sendResponse(response);
  });
  return true;
});
