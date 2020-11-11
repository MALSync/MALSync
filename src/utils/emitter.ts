import { EventEmitter2 } from 'eventemitter2';

/*
  Events with 'global.*' will be triggered across the complete extension. Important second parameter has to be false
*/

const scriptId = Math.floor(Math.random() * 1000000000);

export const emitter = new EventEmitter2({
  wildcard: true,
});

if (typeof api !== 'undefined' && api && api.type === 'webextension') {
  emitter.on('global.**', function(ignore: boolean, ...params) {
    if (ignore) return;
    con
      .m('Global')
      .m('Emit')
      .log(this.event, ...params);

    chrome.runtime.sendMessage({
      name: 'emitter',
      item: { event: this.event, params, id: scriptId },
    });
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.name && message.name === 'emitter') {
      con
        .m('Global')
        .m('Event')
        .log(message.item.id, message.item.event, message.item.params);

      if (message.item.id !== scriptId) {
        emitter.emit(message.item.event, true, ...message.item.params);
      }
    }
  });
}
