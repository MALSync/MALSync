import {
  content,
  emitter,
  minimalWindow,
  responseMessageI,
  sendMessageI,
  videoTime,
  videoTimeSet,
  xhrI,
} from '../api/messageInterface';
import { databaseRequest } from './database';
import { sendNotification } from './notifications';

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
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id!, message);
    });
  });
  return undefined;
}

function xhrAction(message: xhrI, sender, sendResponse, environment, retry = 0) {
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

  if (url.includes('malsync.moe') || url.includes('simkl.com')) {
    (options.headers as [string, string][]).push(['version', api.storage.version()]);
    (options.headers as [string, string][]).push(['type', 'addon']);
  }

  fetch(url, options).then(async response => {
    const responseObj = {
      finalUrl: response.url,
      responseText: await response.text(),
      status: response.status,
    };
    sendResponse(responseObj);
  });
  return true;
}
