import * as helper from './helper';

export async function exportData() {
  const data = await helper.getSyncList();
  const newData = {};
  for (const key in data) {
    if (helper.getRegex('(anime|manga)').test(key)) {
      newData[key] = data[key];
    }
  }
  return newData;
}

export async function importData(newData: {}) {
  const data = await helper.getSyncList();

  // Delete old data
  for (const key in data) {
    if (helper.getRegex('(anime|manga)').test(key)) {
      con.log('Remove', key);
      api.storage.remove(key);
    }
  }

  // import Data
  for (const k in newData) {
    con.log('Set', k, newData[k]);
    api.storage.set(k, newData[k]);
  }

  return 1;
}
