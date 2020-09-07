import { expect } from 'chai';
import * as request from 'request';
import { Single } from '../../../../src/_provider/Kitsu/single';
import * as utils from '../../../../src/utils/general';
import * as def from '../../../../src/_provider/definitions';

import { generalSingleTests } from '../generalSingleTests.exclude';

const state = {};

setGlobals();
function setGlobals() {
  global.con = require('../../../../src/utils/console');
  global.con.log = function() {};
  global.con.error = function() {};
  global.con.info = function() {};

  global.api = {
    token: process.env.KITSU_API_KEY,
    settings: {
      get(key) {
        if ('kitsuToken') return global.api.token;
        throw 'key not defined';
      },
    },
    storage: {
      get(key) {
        return Promise.resolve(undefined);
      },
      set(key, value) {
        state[key] = JSON.parse(JSON.stringify(value));
        return Promise.resolve();
      },
    },
    status: 200,
    request: {
      async xhr(post, conf, data) {
        return new Promise(function(resolve, reject) {
          const options = {
            url: conf.url,
            headers: conf.headers,
            body: conf.data,
          };
          if (post.toLowerCase() === 'get') {
            request.get(options, (error, response, body) => {
              resolve({
                responseText: body,
                status: global.api.status,
              });
            });
          } else if (post.toLowerCase() === 'post') {
            request.post(options, (error, response, body) => {
              resolve({
                responseText: body,
                status: global.api.status,
              });
            });
          } else if (post.toLowerCase() === 'patch') {
            request.patch(options, (error, response, body) => {
              resolve({
                responseText: body,
                status: global.api.status,
              });
            });
          }
        });
      },
    },
  };

  global.btoa = input => input;

  global.utils = utils;

  global.testData = {
    urlTest: [
      {
        url: 'https://kitsu.io/manga/no-game-no-life',
        error: false,
        type: 'manga',
      },
      {
        url: 'https://kitsu.io/anime/no-game-no-life',
        error: false,
        type: 'anime',
      },
      {
        url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
        error: false,
        type: 'anime',
      },
      {
        url: 'https://anilist.co/anime/19815/No-Game-No-Life/',
        error: true,
        type: 'anime',
      },
      {
        url: 'https://simkl.com/anime/46128/no-game-no-life',
        error: true,
        type: 'anime',
      },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://kitsu.io/anime/one-piece',
        displayUrl: 'https://kitsu.io/anime/one-piece',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image:
          'https://media.kitsu.io/anime/poster_images/12/large.jpg?1490541434',
        rating: '82.88%',
        cacheKey: '21',
      },
      notOnListUrl: {
        url: 'https://kitsu.io/anime/shiki-specials',
        displayUrl: 'https://kitsu.io/anime/shiki-specials',
        malUrl: 'https://myanimelist.net/anime/10083/Shiki%20Specials',
        title: 'Shiki Specials',
        eps: 2,
        vol: 0,
      },
      noMalEntry: {
        url: 'https://kitsu.io/manga/ultimate-legend-kang-hae-hyo-manhwa',
        displayUrl:
          'https://kitsu.io/manga/ultimate-legend-kang-hae-hyo-manhwa',
        title: 'Ultimate Legend: Kang Hae Hyo Manhwa',
        eps: 0,
        vol: 0,
        cacheKey: 'kitsu:17240',
      },
      malUrl: {
        url: 'https://myanimelist.net/anime/21/One_Piece',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        displayUrl: 'https://kitsu.io/anime/one-piece',
        title: 'One Piece',
        eps: 0,
        vol: 0,
      },
      nonExistingMAL: {
        url: 'https://myanimelist.net/anime/13371337',
      },
      hasTotalEp: {
        url: 'https://kitsu.io/anime/koe-no-katachi',
      },
    },
  };
}

if (process.env.NO_API) return;

describe('Kitsu single', function() {
  before(function() {
    setGlobals();
  });
  generalSingleTests(Single, setGlobals);
});
