import { expect } from 'chai';
import * as request from 'request';
import { MetaOverview } from '../../../../src/_provider/Simkl/metaOverview.ts';
import * as utils from '../../../../src/utils/general';
setGlobals();
function setGlobals() {
  global.con = require('../../../../src/utils/console');
  global.con.log = function() {};
  global.con.error = function() {};
  global.con.info = function() {};
  global.con.m = function() {
    return global.con;
  };
  global.utils = utils;
  global.localStorage = {
    getItem: function(key) {
      return null;
    },
    setItem: function(key,value) {}
  }
  global.api = {
    token: process.env.SIMKL_API_KEY,
    noManga: true,
    noLimitless: true,
    settings: {
      get(key) {
        if ('simklToken') return global.api.token;
        throw 'key not defined';
      },
    },
    status: 200,
    request: {
      async xhr(post, conf, data) {
        return new Promise(function(resolve, reject) {
          const options = {
            url: conf.url,
            headers: conf.headers,
          };
          if (post.toLowerCase() === 'post') {
            options.body = conf.data;
            request.post(options, (error, response, body) => {
              resolve({
                responseText: body,
                status: global.api.status,
              });
            });
          } else {
            options.body = JSON.stringify(conf.data);
            request.get(options, (error, response, body) => {
              resolve({
                responseText: body,
                status: global.api.status,
              });
            });
          }
        });
      },
    },
    storage: {
      get(key) {
        return Promise.resolve(undefined);
      },
      set(key, value) {
        return Promise.resolve();
      },
    },
  };
}

if (process.env.NO_API) return;

describe('Simkl overview', function() {
  before(function() {
    setGlobals();
  });
  let resObj = {
    title: 'No Game No Life',
    alternativeTitle: [],
    description:
      'Sora and Shiro, a brother and sister whose reputations as brilliant NEET (Not in Education, Employment, or Training) hikikomori (shut-in) gamers have spawned urban legends all over the internet. These two gamers even consider the real world as just another crappy game.<br><br>One day, they are summoned by a boy named Teto to an alternate world, where he is the god. There, Teto has prohibited war and declared this to be a world where everything is decided by games — even national borders. Humanity has been driven back into one remaining city by the other races. Will Sora and Shiro, the good-for-nothing brother and sister, become the Saviours of Humanity on this alternate world?<br><br>"Well, let`s start playing."',
    image: 'https://simkl.in/posters/73/7358518648da77f43_ca.jpg',
    characters: [],
    statistics: [
      {
        title: 'Score:',
        body: 8.4,
      },
      {
        title: 'MAL Score:',
        body: 8.3,
      },
      {
        title: 'Ranked:',
        body: '#208',
      },
      {
        title: 'Votes:',
        body: 1000,
      },
    ],
    info: [
      {
        title: 'Type:',
        body: [
          {
            text: 'tv',
          },
        ],
      },
      {
        title: 'Episodes:',
        body: [
          {
            text: 12,
          },
        ],
      },
      {
        title: 'Status:',
        body: [
          {
            text: 'ended',
          },
        ],
      },
      {
        title: 'Year:',
        body: [
          {
            text: 2014,
          },
        ],
      },
      {
        title: 'Broadcast:',
        body: [
          {
            text: 'Wednesday at 9:30 PM',
          },
        ],
      },
      {
        title: 'Licensor:',
        body: [
          {
            text: 'AT-X',
          },
        ],
      },
      {
        title: 'Genres:',
        body: [
          {
            text: 'Adventure',
            url: 'https://simkl.com/anime/adventure',
          },
          {
            text: 'Comedy',
            url: 'https://simkl.com/anime/comedy',
          },
          {
            text: 'Ecchi',
            url: 'https://simkl.com/anime/ecchi',
          },
          {
            text: 'Fantasy',
            url: 'https://simkl.com/anime/fantasy',
          },
          {
            text: 'Harem',
            url: 'https://simkl.com/anime/harem',
          },
          {
            text: 'Romance',
            url: 'https://simkl.com/anime/romance',
          },
        ],
      },
      {
        title: 'Duration:',
        body: [
          {
            text: '25mins',
          },
        ],
      },
      {
        title: 'Rating:',
        body: [
          {
            text: 'TV-14',
          },
        ],
      },
    ],
    openingSongs: [],
    endingSongs: [],
    related: [
      {
        type: 'Prequel',
        links: [
          {
            url: 'https://simkl.com/anime/601109/no-game-no-life-zero',
            title: 'No Game No Life Zero',
            statusTag: '',
          },
        ],
      },
    ],
  };
  let tests = [
    {
      url: 'https://simkl.com/anime/46128/no-game-no-life/',
      res: resObj
    },
    {
      url: 'https://myanimelist.net/anime/19815/No_Game_No_Life/',
      res: JSON.parse(JSON.stringify(resObj))
    }
  ]
  tests.forEach(test => {
    it(test.url, async function() {
      let m = await new MetaOverview(test.url).init();
      let res = m.getMeta();
      // Clean statistics
      expect(res.statistics.length).to.eql(test.res.statistics.length);
      res.statistics.length = [];
      test.res.statistics.length = [];
      // test
      expect(res).to.eql(test.res);
    });
  })

});
