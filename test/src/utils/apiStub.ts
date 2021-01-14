export function getStub( options:{
  settings?: any
  storage?: any
} = {}) {
  const init = {
    settings: {

    },
    storage: {

    }
  }

  if (options.settings) init.settings = options.settings;
  if (options.storage) init.storage = options.storage;


  const api = {
    settings: {
      get(key) {
        if (typeof init.settings[key] === 'undefined') throw key+' option not set';
        return init.settings[key];
      },
      set(key, value) {
        init.settings[key] = value;
      },
    },
    storage: {
      lang() {
        return 'lang';
      },
      get(key) {
        return Promise.resolve(init.storage[key]);
      },
      set(key, value) {
        init.storage[key] = value;
        return Promise.resolve();
      },
    },
  };

  return api;
}

export function setStub(stub) {
  //@ts-ignore
  global.api = stub;
}
