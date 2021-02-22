import { expect } from 'chai';
import * as request from 'request';
import { Single } from '../../../../src/_provider/Local/single';
import * as utils from '../../../../src/utils/general';
import * as def from '../../../../src/_provider/definitions';

import { generalSingleTests } from '../generalSingleTests.exclude';

const state = {
  'local://crunchyroll/anime/nogamenolife': {
    name: 'Unknown',
    tags: '',
    progress: 0,
    volumeprogress: 0,
    rewatching: false,
    rewatchingCount: 0,
    score: '',
    status: 6,
  },
};

setGlobals();
function setGlobals() {
  global.con = require('../../../../src/utils/console');
  global.con.log = function() {};
  global.con.error = function() {};
  global.con.info = function() {};

  global.api = {
    settings: {
      get(key) {
        return true;
      },
    },
    storage: {
      get(key) {
        return Promise.resolve(state[key]);
      },
      set(key, value) {
        state[key] = JSON.parse(JSON.stringify(value));
        return Promise.resolve();
      },
      assetUrl(key) {
        return 'image';
      },
    },
  };

  global.btoa = input => input;

  global.utils = utils;

  global.testData = {
    urlTest: [
      {
        url: 'local://crunchyroll/anime/nogamenolife',
        error: false,
        type: 'anime',
      },
      {
        url: 'local://crunchyroll/manga/nogamenolife',
        error: false,
        type: 'manga',
      },
      {
        url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
        error: true,
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
        url: 'local://crunchyroll/anime/nogamenolife',
        displayUrl: 'https://github.com/MALSync/MALSync/wiki/Local-Sync',
        malUrl: null,
        title: 'Unknown',
        eps: 0,
        vol: 0,
        image: 'image',
        rating: 'Local',
        cacheKey: 'local:nogamenolife:crunchyroll',
      },
      notOnListUrl: {
        url: 'local://crunchyroll/anime/notonlist',
        displayUrl: 'https://github.com/MALSync/MALSync/wiki/Local-Sync',
        malUrl: null,
        title: 'Unknown',
        eps: 0,
        vol: 0,
      },
    },
  };
}

describe('Local single', function() {
  const titlePrefix = '[L] ';

  before(function() {
    setGlobals();
  });
  generalSingleTests(Single, setGlobals, titlePrefix);

  describe('title', function() {
    [
      'test/213',
      '',
      'Fate/kaleid liner PRISMA☆ILLYA',
      'This is a title',
    ].forEach(el => {
      it(`${el}`, async function() {
        const singleEntry = new Single(
          `local://crunchyroll/anime/notonlist/${encodeURIComponent(el)}`,
        );
        await singleEntry.update();
        if (!el) el = 'Unknown';
        expect(singleEntry.getTitle()).equal(titlePrefix + el);
      });
    });
  });
});
