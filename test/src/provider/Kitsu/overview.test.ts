import { expect } from 'chai';
import * as request from 'request';
import { MetaOverview } from '../../../../src/_provider/Kitsu/metaOverview.ts';
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
    settings: {
      get(key) {
        if ('kitsuOptions') return {
          titleLanguagePreference: 'english'
        }
        throw 'key not defined';
      },
    },
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
}

if (process.env.NO_API) return;

describe('Kitsu overview', function() {
  before(function() {
    setGlobals();
  });
  let resObj = {
    title: 'No Game, No Life',
    alternativeTitle: ['NGNL', 'No Game No Life', 'ノーゲーム・ノーライフ'],
    description:
      '<span style="white-space: pre-line;">No Game No Life is a surreal comedy that follows Sora and Shiro, shut-in NEET siblings and the online gamer duo behind the legendary username "Kuuhaku." They view the real world as just another lousy game; however, a strange e-mail challenging them to a chess match changes everything the brother and sister are plunged into an otherworldly realm where they meet Tet, the God of Games.\r\n\r\nThe mysterious god welcomes Sora and Shiro to Disboard, a world where all forms of conflict—from petty squabbles to the fate of whole countries—are settled not through war, but by way of high-stake games. This system works thanks to a fundamental rule wherein each party must wager something they deem to be of equal value to the other party\'s wager. In this strange land where the very idea of humanity is reduced to child’s play, the indifferent genius gamer duo of Sora and Shiro have finally found a real reason to keep playing games: to unite the sixteen races of Disboard, defeat Tet, and become the gods of this new, gaming-is-everything world.\r\n\r\n(Source: MAL Rewrite)</span>',
    image: 'https://media.kitsu.io/anime/poster_images/7880/large.jpg?1418914006',
    characters: [
      {
        img: 'https://media.kitsu.io/characters/images/82860/original.jpg?1485083465',
        name: 'Shiro',
        url: 'https://myanimelist.net/character/82525',
      },
      {
        img: 'https://media.kitsu.io/characters/images/78882/original.jpg?1485081870',
        name: 'Sora',
        url: 'https://myanimelist.net/character/82523',
      },
      {
        img: 'https://media.kitsu.io/characters/images/40375/original.jpg?1483096805',
        name: 'Former King',
        url: 'https://myanimelist.net/character/105919',
      },
      {
        img: 'https://media.kitsu.io/characters/images/40378/original.jpg?1483096805',
        name: 'Ino Hatsuse',
        url: 'https://myanimelist.net/character/104849',
      },
      {
        img: 'https://media.kitsu.io/characters/images/40377/original.jpg?1483096805',
        name: 'Izuna Hatsuse',
        url: 'https://myanimelist.net/character/97767',
      },
      {
        img: 'https://media.kitsu.io/characters/images/40373/original.jpg?1483096805',
        name: 'Jibril',
        url: 'https://myanimelist.net/character/97761',
      },
      {
        img: 'https://media.kitsu.io/characters/images/92594/original.jpg?1485087372',
        name: 'Miko',
        url: 'https://myanimelist.net/character/106839',
      },
      {
        img: 'https://media.kitsu.io/characters/images/40379/original.jpg?1483096805',
        name: 'Feel Nilvalen',
        url: 'https://myanimelist.net/character/97765',
      },
      {
        img: 'https://media.kitsu.io/characters/images/75916/original.jpg?1485080815',
        name: 'Queen',
        url: 'https://myanimelist.net/character/117075',
      },
      {
        img: 'https://media.kitsu.io/characters/images/40374/original.jpg?1483096805',
        name: 'Teto',
        url: 'https://myanimelist.net/character/97769',
      },
    ],
    statistics: [
      {
        title: 'Score:',
        body: '82.55',
      },
      {
        title: 'Ranked:',
        body: '#39',
      },
      {
        title: 'Popularity:',
        body: '#14',
      },
      {
        title: 'Members:',
        body: 163461,
      },
    ],
    info: [
      {
        title: 'Format:',
        body: [
          {
            text: 'Tv',
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
        title: 'Episode Duration:',
        body: [
          {
            text: '23 mins',
          },
        ],
      },
      {
        title: 'Status:',
        body: [
          {
            text: 'Finished',
          },
        ],
      },
      {
        title: 'Start Date:',
        body: [
          {
            text: '2014-04-09',
          },
        ],
      },
      {
        title: 'Start Date:',
        body: [
          {
            text: '2014-06-25',
          },
        ],
      },
      {
        title: 'Genres:',
        body: [
          {
            text: 'Isekai',
            url: 'https://kitsu.io/anime?categories=isekai',
          },
          {
            text: 'Comedy',
            url: 'https://kitsu.io/anime?categories=comedy',
          },
          {
            text: 'Fantasy',
            url: 'https://kitsu.io/anime?categories=fantasy',
          },
          {
            text: 'Ecchi',
            url: 'https://kitsu.io/anime?categories=ecchi',
          },
          {
            text: 'Fantasy World',
            url: 'https://kitsu.io/anime?categories=fantasy-world',
          },
          {
            text: 'Parody',
            url: 'https://kitsu.io/anime?categories=parody',
          },
        ],
      },
      {
        title: 'Rating:',
        body: [
          {
            text: 'PG',
          },
        ],
      },
      {
        title: 'Total playtime:',
        body: [
          {
            text: '276 mins',
          },
        ],
      },
    ],
    openingSongs: [],
    endingSongs: [],
    related: [
      {
        type: 'Adaptation',
        links: [
          {
            url: 'https://kitsu.io/manga/no-game-no-life-novel',
            title: 'No Game No Life',
            statusTag: '',
          },
        ],
      },
      {
        type: 'Side story',
        links: [
          {
            url: 'https://kitsu.io/anime/no-game-no-life-specials',
            title: 'No Game No Life Specials',
            statusTag: '',
          },
        ],
      },
      {
        type: 'Prequel',
        links: [
          {
            url: 'https://kitsu.io/anime/no-game-no-life-zero',
            title: 'No Game No Life: Zero',
            statusTag: '',
          },
        ],
      },
    ],
  };
  let tests = [
    {
      url: 'https://kitsu.io/anime/no-game-no-life',
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
