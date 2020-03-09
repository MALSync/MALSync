import { expect } from 'chai';
import { Single } from './../../../../src/_provider/Simkl/single';
import * as utils from './../../../../src/utils/general';
import * as def from './../../../../src/_provider/definitions';

import {generalSingleTests} from './../generalSingleTests.exclude';

import * as request from 'request';

setGlobals()
function setGlobals() {
  global.con = require('./../../../../src/utils/console');
  global.con.log = function() {};
  global.con.error = function() {};
  global.con.info = function() {};

  global.api = {
    token: process.env.SIMKL_API_KEY,
    settings: {
      get: function(key) {
        if('simklToken') return global.api.token;
        throw 'key not defined';
      }
    },
    status: 200,
    request: {
      xhr: async function(post, conf, data) {
        return new Promise(function(resolve, reject) {
          var options = {
            url: conf.url,
            headers: conf.headers,
            body: conf.data
          }
          request.post(options, (error, response, body) => {
            resolve({
              responseText: body,
              status: global.api.status
            })
          });
        });
      }
    },
  }

  global.btoa = (input) => input;

  global.utils = utils;

  global.testData = {
    urlTest: [
      {
        url: 'https://simkl.com/anime/46128/no-game-no-life',
        error: false,
        type: 'anime',
      },
      {
        url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
        error: false,
        type: 'anime',
      },
      {
        url: 'https://kitsu.io/anime/no-game-no-life',
        error: true,
        type: 'anime',
      },
      {
        url: 'https://anilist.co/anime/19815/No-Game-No-Life/',
        error: true,
        type: 'anime',
      }
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://simkl.com/anime/38636/one-piece',
        displayUrl: 'https://anilist.co/anime/21',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/nx21-tXMN3Y20PIL9.jpg',
        rating: 83,
        cacheKey: 21,
      },
      notOnListUrl: {
        url: 'https://simkl.com/anime/39821/shiki',
        displayUrl: 'https://anilist.co/anime/10083',
        malUrl: 'https://myanimelist.net/anime/10083/Shiki%20Specials',
        title: "Shiki Specials",
        eps: 2,
        vol: 0,
      },
      noMalEntry: {
        url: 'https://simkl.com/anime/901533/jiyi-u-pan',
        displayUrl: 'https://anilist.co/manga/115067',
        title: 'Kagami no Kuni no Iris: SCP Foundation',
        eps: 0,
        vol: 0,
        cacheKey: 'anilist:115067',
      },
      malUrl: {
        url: 'https://myanimelist.net/anime/21/One_Piece',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        displayUrl: 'https://anilist.co/anime/21',
        title: 'One Piece',
        eps: 0,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://myanimelist.net/anime/13371337',
      },
      hasTotalEp: {
        url: 'https://simkl.com/anime/901533/jiyi-u-pan',
      },
    }
  }
}

describe('Simkl single', function () {
  before(function () {
    setGlobals();
  })
  generalSingleTests(Single, setGlobals);
});
