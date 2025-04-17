import {
  content,
  emitter,
  minimalWindow,
  responseMessageI,
  sendMessageI,
  videoTime,
  videoTimeSet,
  xhrI,
  xhrResponseI,
} from '../api/messageInterface';
import { databaseRequest } from './database';
import { sendNotification } from './notifications';

const activeEmitterTabs = new Set<number>();

export function initMessageHandler() {
  chrome.runtime.onMessage.addListener((message: sendMessageI, sender, sendResponse) => {
    return messageHandler(message, sender, sendResponse, 'content');
  });

  api.request.sendMessage = function (message: sendMessageI) {
    return new Promise((resolve, reject) => {
      messageHandler(
        message,
        null,
        function (response: responseMessageI) {
          resolve(response);
        },
        'background',
      );
    });
  };
}

function messageHandler(
  message: sendMessageI,
  sender,
  sendResponse,
  environment: 'background' | 'content',
) {
  switch (message.name) {
    case 'xhr':
      return xhrAction(message, sender, sendResponse, environment);
    case 'videoTime':
      return videoTimeAction(message, sender, sendResponse);
    case 'content':
      return contentAction(message, sender, sendResponse);
    case 'videoTimeSet':
      return videoTimeSetAction(message, sender, sendResponse);
    case 'minimalWindow':
      return minimalWindowAction(message, sender, sendResponse);
    case 'emitter':
      return emitterAction(message, sender, sendResponse);
    case 'notification': {
      sendNotification(message.options);
      return undefined;
    }
    case 'database': {
      databaseRequest(message.options.call, message.options.param).then(res => sendResponse(res));
      return true;
    }
    case 'registerEmitter': {
      if (sender.tab?.id) registerEmitterTab(sender.tab.id);
      return undefined;
    }
    default:
      throw new Error(`Unknown action: ${message.name}`);
  }
}

function videoTimeAction(message: videoTime, sender, sendResponse) {
  chrome.tabs.sendMessage(sender.tab.id, {
    action: 'videoTime',
    item: message.item,
    sender,
  });
  return undefined;
}

function contentAction(message: content, sender, sendResponse) {
  chrome.tabs.sendMessage(sender.tab.id, {
    action: 'content',
    item: message.item,
    sender,
  });
  return undefined;
}

function videoTimeSetAction(message: videoTimeSet, sender, sendResponse) {
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

function minimalWindowAction(message: minimalWindow, sender, sendResponse) {
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

function emitterAction(message: emitter, sender, sendResponse) {
  chrome.runtime.sendMessage(message);

  activeEmitterTabs.forEach(tabId => {
    chrome.tabs.sendMessage(tabId, message).catch(() => {
      activeEmitterTabs.delete(tabId);
    });
  });
  return undefined;
}

function registerEmitterTab(tabId: number) {
  activeEmitterTabs.add(tabId);
}

export function xhrAction(
  message: xhrI,
  sender,
  sendResponse,
  environment,
  retry = { try: 0, date: new Date() },
) {
  let url;
  const options: RequestInit = {
    method: message.method,
    headers: [] as [string, string][],
  };

  if (typeof message.url === 'object') {
    url = message.url.url;
    if (message.url.data) {
      options.body = message.url.data;
    }
    for (const key in message.url.headers) {
      (options.headers as [string, string][]).push([key, message.url.headers[key]]);
    }
  } else {
    url = message.url;
  }

  if (utils.isDomainMatching(url, 'malsync.moe') || utils.isDomainMatching(url, 'simkl.com')) {
    (options.headers as [string, string][]).push(['version', api.storage.version()]);
    (options.headers as [string, string][]).push(['type', 'addon']);
  }

  if (environment === 'testing') {
    (options.headers as [string, string][]).push(['X-MALSYNC-TEST', JSON.stringify(message)]);
  }

  fetch(url, options)
    .then(async response => {
      if (response.status === 429) {
        let limits: { timeout: number; tries: number; cutoff: number };
        if (environment === 'content') {
          limits = {
            timeout: 30000,
            tries: 4,
            cutoff: 180000,
          };
        } else {
          limits = {
            timeout: 300000,
            tries: 4,
            cutoff: 30 * 60 * 1000,
          };
        }

        if (
          retry.try < limits.tries &&
          !utils.rateLimitExclude.test(response.url) &&
          new Date().getTime() - retry.date.getTime() < limits.cutoff
        ) {
          con.error('RATE LIMIT');
          setTimeout(() => {
            retry.try++;
            xhrAction(message, sender, sendResponse, environment, retry);
            api.storage.set('rateLimit', false);
          }, limits.timeout);
          if (environment === 'content') api.storage.set('rateLimit', true);
          return;
        }
      }

      if (environment === 'background') {
        await utils.wait(5000);
      }

      const responseObj: xhrResponseI = {
        finalUrl: response.url,
        responseText: await response.text(),
        status: response.status,
      };
      sendResponse(responseObj);
    })
    .catch(err => {
      const responseObj: xhrResponseI = {
        finalUrl: '',
        responseText: err.message,
        status: 0,
      };
      sendResponse(responseObj);
    });
  return true;
}
