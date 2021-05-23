import { expect } from 'chai';
import { UserList } from '../../../../src/_provider/Simkl/list';
import { generalListTests } from '../generalTests.exclude';

global.con = require('../../../../src/utils/console');

global.con.log = function() {};
global.con.error = function() {};
global.con.info = function() {};

const responses = {
  activities: {
    data: JSON.stringify(require('./api/activities.json')),
  },
  'all-items': {
    data: JSON.stringify(require('./api/all-items.json')),
  },
};

const elements = [
  {
    malId: '8937',
    uid: 38165,
    apiCacheKey: '8937',
    cacheKey: '8937',
    type: 'anime',
    title: 'Toaru Majutsu no Index II',
    url: 'https://simkl.com/anime/38165',
    watchedEp: 24,
    totalEp: 24,
    status: 2,
    score: 9,
    image: 'https://simkl.in/posters/80/80487132e5f159f87_ca.jpg',
    tags: undefined,
    airingState: undefined,
  },
  {
    malId: '5667',
    uid: 38020,
    apiCacheKey: '5667',
    cacheKey: '5667',
    type: 'anime',
    title: 'To Love-Ru: Trouble',
    url: 'https://simkl.com/anime/38020',
    watchedEp: 6,
    totalEp: 6,
    status: 2,
    score: 8,
    image: 'https://simkl.in/posters/97/97507290cb6d72_ca.jpg',
    tags: undefined,
    airingState: undefined,
  },
];

global.api = {};

function getResponse(key) {
  return responses[key].data;
}

describe('Simkl UserList', function() {
  before(function() {
    global.api = {
      request: {
        async xhr(post, conf, data) {
          if (conf.url.indexOf('sync/activities') !== -1) {
            return {
              responseText: getResponse('activities'),
              status: 200,
            };
          }
          if (conf.url.indexOf('all-items') !== -1) {
            return {
              responseText: getResponse('all-items'),
              status: 200,
            };
          }

          throw conf.url;
        },
      },
      settings: {
        get() {
          return '';
        },
      },
      storage: {
        lang() {
          return 'lang';
        },
        get(key) {
          return '';
        },
        set(key, val) {},
      },
    };
  });

  generalListTests(UserList, elements, responses, { noContinueCall: true });
});
