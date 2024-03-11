export function getStub( options:{
  settings?: any
  storage?: any
  request?: any
} = {}) {
  const init = {
    settings: {

    },
    storage: {

    },
    request: {

    }
  }

  if (options.settings) init.settings = options.settings;
  if (options.storage) init.storage = options.storage;
  if (options.request) init.request = options.request;


  const api = {
    settings: {
      get(key) {
        if (typeof init.settings[key] === 'undefined') throw key+' option not set';
        return init.settings[key];
      },
      set(key, value) {
        init.settings[key] = value;
      },
      getAsync(key) {
        return Promise.resolve(api.settings.get(key));
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
    request: {
      async xhr(post, conf, data) {
        const url = conf.url ?? conf;
        if (typeof init.request[url] === 'undefined') throw ' No request for: '+url;
        return Promise.resolve(init.request[url]);
      },
    },
  };

  return api;
}

export function setStub(stub) {
  //@ts-ignore
  global.api = stub;
}

export function setGlobals() {
  //@ts-ignore
  global.con = require('../../../src/utils/console');
  //@ts-ignore
  global.utils = require('../../../src/utils/general');
  //@ts-ignore
  global.con.log = function() {};
  //@ts-ignore
  global.con.error = function() {};
  //@ts-ignore
  global.con.info = function() {};
}
