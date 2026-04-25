let store: Pick<Storage, 'getItem' | 'setItem' | 'clear' | 'removeItem'>;

if (checkLocalStorageIsAvailable()) {
  store = localStorage;
} else {
  let storage = {};
  store = {
    getItem(key) {
      return key in storage ? storage[key] : null;
    },
    setItem(key, value) {
      storage[key] = value;
    },
    removeItem(key) {
      if (key in storage) delete storage[key];
    },
    clear() {
      storage = {};
    },
  };
}

export const localStore = store;

function checkLocalStorageIsAvailable() {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.getItem('x');
    return true;
  } catch (e) {
    con.info('Local storage is not available', e);
    return false;
  }
}
