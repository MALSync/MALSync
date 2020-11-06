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
      await api.storage.remove(key).catch(e => {
        if (e.message) {
          if (e.message.includes('MAX_WRITE_OPERATIONS_PER_MINUTE')) {
            utils.flashm(
              'Max write operations per minute hit. Import stopped for 1 minute. Just keep this window open.',
            );
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(api.storage.remove(key));
              }, 60 * 1000);
            });
          }
        }
        throw e;
      });
    }
  }

  // import Data
  for (const k in newData) {
    con.log('Set', k, newData[k]);
    await api.storage.set(k, newData[k]).catch(e => {
      if (e.message) {
        if (e.message.includes('MAX_WRITE_OPERATIONS_PER_MINUTE')) {
          utils.flashm('Max write operations per minute hit. Import stopped for 1 minute. Just keep this window open.');
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(api.storage.set(k, newData[k]));
            }, 60 * 1000);
          });
        }
      }
      throw e;
    });
  }

  return 1;
}
