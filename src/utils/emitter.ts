import { EventEmitter2 } from 'eventemitter2';

const scriptId = Math.floor(Math.random() * 1000000000);

export const emitter = new EventEmitter2({
  wildcard: true,
});

export function globalEmit(eventName: string, ...params) {
  con
    .m('Global')
    .m('Emit')
    .debug(eventName, ...params);

  emitter.emit(`${eventName}`, ...params);

  if (typeof api !== 'undefined' && api && api.type === 'webextension') {
    chrome.runtime.sendMessage({
      name: 'emitter',
      item: { event: eventName, params, id: scriptId },
    });
  }
}

if (typeof api !== 'undefined' && api && api.type === 'webextension') {
  chrome.runtime.sendMessage({
    name: 'registerEmitter',
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.name && message.name === 'emitter') {
      con.m('Global').m('Event').debug(message.item.id, message.item.event, message.item.params);

      if (message.item.id !== scriptId) {
        emitter.emit(message.item.event, ...message.item.params);
      }
    }
  });
}
