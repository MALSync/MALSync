import { EventEmitter2 } from 'eventemitter2';

const scriptId = Math.floor(Math.random() * 1000000000);

const KEY_PREFIX = 'emit:';
const STALE_MS = 10000;

interface EmitRecord {
  event: string;
  params: any[];
  id: number;
  ts: number;
}

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
    const ts = Date.now();
    const key = `${KEY_PREFIX}${eventName}:${scriptId}:${ts}`;
    let safeParams = params;
    try {
      safeParams = JSON.parse(JSON.stringify(params));
    } catch (e) {
      con.m('Global').m('Emit').error('Could not serialize params', e);
    }
    chrome.storage.local
      .set({
        [key]: { event: eventName, params: safeParams, id: scriptId, ts },
      })
      .catch(e => con.m('Global').m('Emit').error(e));
  }
}

if (typeof api !== 'undefined' && api && api.type === 'webextension') {
  chrome.storage.local.onChanged.addListener(changes => {
    const now = Date.now();
    Object.keys(changes).forEach(key => {
      if (!key.startsWith(KEY_PREFIX)) return;
      const change = changes[key];
      if (!change.newValue) return;
      const value = change.newValue as EmitRecord | undefined;
      if (!value || typeof value !== 'object') return;
      const isStale = typeof value.ts === 'number' && now - value.ts > STALE_MS;
      if (value.id !== scriptId && !isStale) {
        con.m('Global').m('Event').debug(value.id, value.event, value.params);
        emitter.emit(value.event, ...(value.params || []));
      }
    });
  });
}

export function registerBackgroundEmitterCleanup() {
  chrome.storage.local.onChanged.addListener(changes => {
    const keys = Object.keys(changes).filter(k => k.startsWith(KEY_PREFIX) && changes[k].newValue);
    if (keys.length) chrome.storage.local.remove(keys).catch(() => {});
  });
}
