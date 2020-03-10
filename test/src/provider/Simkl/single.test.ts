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
    noManga: true,
    noLimitless: true,
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
          }
          if(post.toLowerCase() === 'post'){
            options.body = conf.data;
            request.post(options, (error, response, body) => {
              resolve({
                responseText: body,
                status: global.api.status
              })
            });
          }else{
            options.body = JSON.stringify(conf.data);
            request.get(options, (error, response, body) => {
              resolve({
                responseText: body,
                status: global.api.status
              })
            });
          }

        });
      }
    },
    storage: {
      get: function(key) {
        return Promise.resolve(undefined);
      },
      set: function(key, value) {
        //state[key] = JSON.parse(JSON.stringify(value));
        return Promise.resolve();
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
        displayUrl: 'https://simkl.com/anime/38636',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        title: 'One Piece',
        eps: 928,
        vol: 0,
        image: 'https://simkl.in/posters/72/7248108487b1ea37_ca.jpg',
        rating: 8.6,
        cacheKey: '21',
      },
      notOnListUrl: {
        url: 'https://simkl.com/anime/39821/shiki',
        displayUrl: 'https://simkl.com/anime/39821',
        malUrl: 'https://myanimelist.net/anime/7724/Shiki',
        title: "Shiki",
        eps: 0,
        vol: 0,
      },
      noMalEntry: {
        url: 'https://simkl.com/anime/901533/jiyi-u-pan',
        displayUrl: 'https://simkl.com/anime/901533',
        title: 'Jiyi U Pan',
        eps: 1,
        vol: 0,
        cacheKey: 'anilist:901533',
      },
      malUrl: {
        url: 'https://myanimelist.net/anime/21/One_Piece',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        displayUrl: 'https://simkl.com/anime/38636',
        title: 'One Piece',
        eps: 928,
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
