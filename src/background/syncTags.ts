/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/explicit-module-boundary-types */
let stopped = 0;

interface SyncItem {
  key: string;
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  timestamp: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveInList(key: string, el: any) {
  if (stopped) return Promise.resolve();
  con.info('Save', key, 'in sync list [', el, ']');
  return api.storage.get('list-tagSettings').then(listDataRaw => {
    let list: SyncItem[] = [];
    const listData = listDataRaw && listDataRaw !== 'undefined' ? listDataRaw : '[]';
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = JSON.parse(listData);
      if (Array.isArray(parsed)) {
        list = parsed as SyncItem[];
      } else {
        throw new Error('Not an array');
      }
    } catch (e) {
      con.error(e);
      list = [];
    }
    list.push({
      key,
      value: el, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      timestamp: new Date().getTime(),
    });
    while (list.length > 50) {
      list.shift();
    }
    api.storage.set('tm-list-tagSettings', new Date().getTime()); // eslint-disable-line @typescript-eslint/no-floating-promises
    stopped = 1;
    return api.storage
      .set('list-tagSettings', JSON.stringify(list))
      .then(() => {
        stopped = 0;
      })
      .catch(e => {
        con.error(e);
        stopped = 0;
      });
  });
}

function importList() {
  stopped = 1;
  con.info('Import sync list');
  let num = 0;
  return api.storage
    .get('list-tagSettings')
    .then(async listDataRaw => {
      let list: SyncItem[] = [];
      const listData = listDataRaw && listDataRaw !== 'undefined' ? listDataRaw : '[]';
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = JSON.parse(listData);
        if (Array.isArray(parsed)) {
          list = parsed as SyncItem[];
        }
      } catch (e) {
        con.error(e);
        list = [];
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let curDate: number = await api.storage.get('tm-list-tagSettings');
      if (!curDate) curDate = 2;
      // Fix: Use standard for loop to avoid generator runtime requirement
      for (let i = 0; i < list.length; i++) {
        const el = list[i];
        if (el.timestamp > curDate) {
          con.info('Import', el.key, el.value);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-await-in-loop, @typescript-eslint/no-unsafe-argument
          await api.storage.set(el.key, el.value);
          num++;
        }
      }
      api.storage.set('tm-list-tagSettings', new Date().getTime()); // eslint-disable-line @typescript-eslint/no-floating-promises
      con.info('list imported', num);
      stopped = 0;
    })
    .catch(e => {
      con.error(e);
      stopped = 0;
    });
}

export function initSyncTags() {
  con.info('SyncTags Loaded');
  api.storage.storageOnChanged((changes, namespace) => {
    if (namespace === 'local') {
      for (const key in changes) {
        if (/^tagSettings\//i.test(key)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-floating-promises
          saveInList(key, changes[key].newValue);
        }
      }
    } else {
      for (const key in changes) {
        if (key === 'list-tagSettings' && !stopped) {
          importList(); // eslint-disable-line @typescript-eslint/no-floating-promises
        }
      }
    }
  });
  importList(); // eslint-disable-line @typescript-eslint/no-floating-promises
}
