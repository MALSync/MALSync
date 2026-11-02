window.chrome = {
  runtime: {
    onMessage: {
      addListener: function(callback) {
        console.log('chrome.runtime.onMessage.addListener', callback);
      }
    },
    sendMessage: function(message, callback) {
      console.log('chrome.runtime.sendMessage', message, callback);
    },
    getURL: function(path) {
      console.log('chrome.runtime.getURL', path);
      return '';
    },
    getManifest: function() {
      console.log('chrome.runtime.getManifest');
      return {
        version: '10.1.1',
      };
    }
  },
  storage: {
    local: {
      get: function(keys, callback) {
        console.log('chrome.storage.local.get', keys, callback);
        callback({});
        return Promise.resolve({});
      },
      set: function(items, callback) {
        console.log('chrome.storage.local.set', items, callback);
        if (callback) {
          callback();
        }
        return Promise.resolve({});
      }
    },
    sync: {
      get: function(keys, callback) {
        console.log('chrome.storage.sync.get', keys, callback);
        callback({});
        return Promise.resolve({});
      },
      set: function(items, callback) {
        console.log('chrome.storage.sync.set', items, callback);
        if (callback) {
          callback();
        }
        return Promise.resolve({});
      }
    },
    onChanged: {
      addListener: function(callback) {
        console.log('chrome.storage.onChanged.addListener', callback);
      }
    }
  },
};
