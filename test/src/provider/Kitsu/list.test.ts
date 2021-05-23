import { expect } from 'chai';
import { UserList } from '../../../../src/_provider/Kitsu/list';
import { generalListTests } from '../generalTests.exclude';

global.con = require('../../../../src/utils/console');

global.con.log = function() {};
global.con.error = function() {};
global.con.info = function() {};

const responses = {
  user: {
    data: JSON.stringify(require('./api/user.json')),
  },
  Page1: {
    data: JSON.stringify(require('./api/list-Page1.json')),
  },
  Page2: {
    data: JSON.stringify(require('./api/list-Page2.json')),
  },
};

const elements = [
  {
    malId: '6547',
    uid: '4604',
    apiCacheKey: '6547',
    cacheKey: '6547',
    kitsuSlug: 'angel-beats',
    type: 'anime',
    title: 'Angel Beats!',
    url: 'https://kitsu.io/anime/angel-beats',
    watchedEp: 13,
    totalEp: 13,
    status: 2,
    score: 10,
    image:
      'https://media.kitsu.io/anime/poster_images/4604/large.jpg?1416274148',
    tags: '\n=== MAL Tags ===\nScore: 8.35',
    airingState: undefined,
  },
  {
    malId: '9776',
    uid: '5861',
    apiCacheKey: '9776',
    cacheKey: '9776',
    kitsuSlug: 'a-channel',
    type: 'anime',
    title: 'A-Channel',
    url: 'https://kitsu.io/anime/a-channel',
    watchedEp: 12,
    totalEp: 12,
    status: 2,
    score: 9,
    image:
      'https://media.kitsu.io/anime/poster_images/5861/large.jpg?1486237007',
    tags: '\n=== MAL Tags ===\nScore: 7.04',
    airingState: undefined,
  },
];

global.api = {};

function getResponse(key) {
  return responses[key].data;
}

describe('Kitsu UserList', function() {
  before(function() {
    global.api = {
      request: {
        async xhr(post, conf, data) {
          if (conf.url.indexOf('/edge/users') !== -1) {
            return {
              responseText: getResponse('user'),
            };
          }

          if (conf.url.indexOf('page[offset]=0') !== -1) {
            return {
              responseText: getResponse('Page1'),
            };
          }

          if (conf.url.indexOf('page[offset]=50') !== -1) {
            return {
              responseText: getResponse('Page2'),
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
          if (key === 'kitsuUserId') return undefined;
          return '';
        },
        set(key, val) {},
      },
    };
  });

  generalListTests(UserList, elements, responses);
});
