import { expect } from 'chai';
import { UserList } from '../../../../src/_provider/AniList/list';
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
    uid: 9624,
    malId: 9624,
    apiCacheKey: 9624,
    cacheKey: 9624,
    type: 'anime',
    title: '30-sai no Hoken Taiiku',
    url: 'https://anilist.co/anime/9624',
    watchedEp: 0,
    totalEp: 12,
    status: 6,
    score: 0,
    image:
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b9624-VKt16M5xFfkG.jpg',
    tags: null,
    airingState: undefined,
  },
  {
    uid: 112124,
    malId: 40454,
    apiCacheKey:  40454,
    cacheKey: 40454,
    type: 'anime',
    title: 'Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka III',
    url: 'https://anilist.co/anime/112124',
    watchedEp: 0,
    totalEp: 0,
    status: 6,
    score: 0,
    image:
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b112124-fY30NnaklY5W.jpg',
    tags: null,
    airingState: undefined,
  },
];

global.api = {};

function getResponse(key) {
  return responses[key].data;
}

describe('AniList UserList', function() {
  before(function() {
    global.api = {
      request: {
        async xhr(post, conf, data) {
          conf.data = JSON.parse(conf.data);
          if (!conf.data.variables.page) {
            return {
              responseText: getResponse('user'),
            };
          }

          if (conf.data.variables.page === 1) {
            return {
              responseText: getResponse('Page1'),
            };
          }

          return {
            responseText: getResponse('Page2'),
          };
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
          if (key.indexOf('continue') !== -1) return '';
          if (key.indexOf('resume') !== -1) return '';
          if (key.indexOf('tagSettings') !== -1) return '';
          throw '[storage] key not found '+key;
        }
      },
    };
  });

  generalListTests(UserList, elements, responses);
});
