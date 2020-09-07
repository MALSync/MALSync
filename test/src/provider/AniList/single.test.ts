import { expect } from 'chai';
import * as request from 'request';
import { Single } from '../../../../src/_provider/AniList/single';
import * as utils from '../../../../src/utils/general';
import * as def from '../../../../src/_provider/definitions';

import { generalSingleTests } from '../generalSingleTests.exclude';

setGlobals();
function setGlobals() {
  global.con = require('../../../../src/utils/console');
  global.con.log = function() {};
  global.con.error = function() {};
  global.con.info = function() {};

  global.api = {
    token: process.env.ANILIST_API_KEY,
    settings: {
      get(key) {
        if ('anilistToken') return global.api.token;
        throw 'key not defined';
      },
    },
    storage: {
      get(key) {
        if (key.indexOf('continue') !== -1) return '';
        if (key.indexOf('resume') !== -1) return '';
        if (key.indexOf('tagSettings') !== -1) return '';
        throw '[storage] key not found '+key;
      }
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
          request.post(options, (error, response, body) => {
            resolve({
              responseText: body,
              status: global.api.status,
            });
          });
        });
      },
    },
  };

  global.btoa = input => input;

  global.utils = utils;

  global.testData = {
    urlTest: [
      {
        url: 'https://anilist.co/manga/78397/No-Game-No-Life/',
        error: false,
        type: 'manga',
      },
      {
        url: 'https://anilist.co/anime/19815/No-Game-No-Life/',
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
        url: 'https://simkl.com/anime/46128/no-game-no-life',
        error: true,
        type: 'anime',
      },
    ],
    apiTest: {
      defaultUrl: {
        url: 'https://anilist.co/anime/21/One-Piece/',
        displayUrl: 'https://anilist.co/anime/21',
        malUrl: 'https://myanimelist.net/anime/21/One%20Piece',
        title: 'One Piece',
        eps: 0,
        vol: 0,
        image:
          'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/nx21-tXMN3Y20PIL9.jpg',
        rating: 83,
        cacheKey: 21,
      },
      notOnListUrl: {
        url: 'https://anilist.co/anime/10083/Shiki-Specials/',
        displayUrl: 'https://anilist.co/anime/10083',
        malUrl: 'https://myanimelist.net/anime/10083/Shiki%20Specials',
        title: 'Shiki Specials',
        eps: 2,
        vol: 0,
      },
      noMalEntry: {
        url:
          'https://anilist.co/manga/115067/Kagami-no-Kuni-no-Iris-SCP-Foundation/',
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
        url: 'https://anilist.co/anime/20954/Koe-no-Katachi/',
      },
    },
  };
}

if(!process.env.ANILIST_API_KEY) return;

describe('AniList single', function() {
  before(function() {
    setGlobals();
  });
  generalSingleTests(Single, setGlobals);
});
