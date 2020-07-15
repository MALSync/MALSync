import { expect } from 'chai';
import { userlist } from '../../../../src/_provider/MyAnimeList_legacy/list';
import { generalListTests } from '../generalTests.exclude';

global.con = require('../../../../src/utils/console');

global.con.log = function() {};
global.con.error = function() {};
global.con.info = function() {};

const responses = {
  user: {
    data: require('./api/user.json').data,
    errorCode: 400,
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
    uid: 39482,
    malId: 39482,
    cacheKey: 39482,
    type: 'anime',
    title: 'Ore, Twintail ni Narimasu. Tokubetsu-hen',
    url:
      'https://myanimelist.net/anime/39482/Ore_Twintail_ni_Narimasu_Tokubetsu-hen',
    watchedEp: 0,
    totalEp: 1,
    status: 1,
    score: 0,
    image:
      'https://cdn.myanimelist.net/r/96x136/images/anime/1845/99646.webp?s=d385c800feb4eac0eabe800b434d9e7e',
    tags: '',
    airingState: 2,
  },
  {
    uid: 27,
    malId: 27,
    cacheKey: 27,
    type: 'anime',
    title: 'Trinity Blood',
    url: 'https://myanimelist.net/anime/27/Trinity_Blood',
    watchedEp: 0,
    totalEp: 24,
    status: 6,
    score: 0,
    image:
      'https://cdn.myanimelist.net/r/96x136/images/anime/10/24649.webp?s=a6f926d3a8fbd12aec483b2656de7cad',
    tags: '',
    airingState: 2,
  },
];

global.api = {};

function getResponse(key) {
  return responses[key].data;
}

describe('MyAnimeList userlist', function() {
  before(function() {
    global.api = {
      request: {
        async xhr(post, conf, data) {
          if (conf.indexOf('panel.php') !== -1) {
            return {
              responseText: getResponse('user'),
            };
          }

          if (conf.indexOf('offset=0') !== -1) {
            return {
              responseText: getResponse('Page1'),
            };
          }

          if (conf.indexOf('offset=300') !== -1) {
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

  generalListTests(userlist, elements, responses);
});
