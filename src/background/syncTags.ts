let stopped = 0;

function saveInList(key, el) {
  if (stopped) return Promise.resolve();
  con.info('Save', key, 'in sync list [', el, ']');
  return api.storage.get('list-tagSettings').then(list => {
    try {
      list = JSON.parse(list);
    } catch (e) {
      list = [];
    }
    list.push({
      key,
      value: el,
      timestamp: new Date().getTime(),
    });
    while (list.length > 50) {
      list = list.shift();
    }
    api.storage.set('tm-list-tagSettings', new Date().getTime());
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
    .then(async list => {
      try {
        list = JSON.parse(list);
      } catch (e) {
        list = [];
      }
      let curDate = await api.storage.get('tm-list-tagSettings');
      if (!curDate) curDate = 2;
      for (const i in list) {
        const el = list[i];
        if (el.timestamp > curDate) {
          con.info('Import', el.key, el.value);
          await api.storage.set(el.key, el.value);
          num++;
        }
      }
      api.storage.set('tm-list-tagSettings', new Date().getTime());
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
          saveInList(key, changes[key].newValue);
        }
      }
    } else {
      for (const key in changes) {
        if (key === 'list-tagSettings' && !stopped) {
          importList();
        }
      }
    }
  });
  importList();
}
