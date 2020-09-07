import { expect } from 'chai';
import * as request from 'request';
import { MetaOverview } from '../../../../src/_provider/AniList/metaOverview.ts';
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
}

if (process.env.NO_API) return;

describe('AniList overview', function() {
  before(function() {
    setGlobals();
  });
  let resObj = {
    title: 'No Game No Life',
    alternativeTitle: ['No Game, No Life', 'ノーゲーム・ノーライフ'],
    description:
      '<p>The story of No Game, No Life centers around Sora and Shiro, a brother and sister whose reputations as brilliant NEET (Not in Education, Employment, or Training) hikikomori (shut-in) gamers have spawned urban legends all over the Internet. These two gamers even consider the real world as just another &quot;crappy game.&quot;<br><br><br />\nOne day, they are summoned to another world where a young boy named Tet appears before them, claiming to be the “God” of this world. In this world populated by magical creatures, violence is forbidden, humanity is on the brink of extinction and all matters are settled through games. Using their combined intellect, questionable morals and considerable guile, it is up to these siblings to swindle their way to the top in a series of increasingly intriguing and deceptively deadly games.<br><br><br />\n(Source: Anime News Network)</p>',
    image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/nx19815-bIo51RMWWhLv.jpg',
    characters: [
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/n82523-W3XG4FLDGSQZ.jpg',
        name: 'Sora',
        url: 'https://anilist.co/character/82523',
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/n82525-Le2tc8f6OQ0w.jpg',
        name: 'Shiro',
        url: 'https://anilist.co/character/82525',
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/b82527-vnRsuLvsinP3.png',
        name: 'Dola, Stephanie',
        url: 'https://anilist.co/character/82527',
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/n87887-Qia1XfXbLP4u.jpg',
        name: 'Jibril',
        url: 'https://anilist.co/character/87887',
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/88001.jpg',
        name: 'Zell, Chlammy',
        url: 'https://anilist.co/character/88001',
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/88002.jpg',
        name: 'Nilvalen, Fiel',
        url: 'https://anilist.co/character/88002',
      },
    ],
    statistics: [
      { title: 'Score:', body: 80 },
      { title: 'Favourites:', body: 6930 },
      { title: 'Popularity:', body: 149219 },
      { title: 'Highest rated:', body: '#176' },
    ],
    info: [
      {
        "title": "Format:",
        "body": [
          {
            "text": "Tv"
          }
        ]
      },
      {
        "title": "Episodes:",
        "body": [
          {
            "text": 12
          }
        ]
      },
      {
        "title": "Episode Duration:",
        "body": [
          {
            "text": "24 mins"
          }
        ]
      },
      {
        "title": "Status:",
        "body": [
          {
            "text": "Finished"
          }
        ]
      },
      {
        "title": "Start Date:",
        "body": [
          {
            "text": "2014-4-9"
          }
        ]
      },
      {
        "title": "End Date:",
        "body": [
          {
            "text": "2014-6-25"
          }
        ]
      },
      {
        "title": "Season:",
        "body": [
          {
            "text": "Spring 2014"
          }
        ]
      },
      {
        "title": "Studios:",
        "body": [
          {
            "text": "MADHOUSE",
            "url": "https://anilist.co/studio/11"
          }
        ]
      },
      {
        "title": "Source:",
        "body": [
          {
            "text": "Light novel"
          }
        ]
      },
      {
        "title": "Genres:",
        "body": [
          {
            "text": "Adventure",
            "url": "https://anilist.co/search/anime?includedGenres=Adventure"
          },
          {
            "text": "Comedy",
            "url": "https://anilist.co/search/anime?includedGenres=Comedy"
          },
          {
            "text": "Ecchi",
            "url": "https://anilist.co/search/anime?includedGenres=Ecchi"
          },
          {
            "text": "Fantasy",
            "url": "https://anilist.co/search/anime?includedGenres=Fantasy"
          }
        ]
      },
      {
        "title": "External Links:",
        "body": [
          {
            "text": "Official Site",
            "url": "http://ngnl.jp/"
          },
          {
            "text": "Crunchyroll",
            "url": "http://www.crunchyroll.com/no-game-no-life"
          },
          {
            "text": "Hulu",
            "url": "http://www.hulu.com/no-game-no-life"
          },
          {
            "text": "Twitter",
            "url": "https://twitter.com/ngnl_anime"
          },
          {
            "text": "AnimeLab",
            "url": "https://www.animelab.com/shows/no-game-no-life"
          },
          {
            "text": "Hidive",
            "url": "https://www.hidive.com/tv/no-game-no-life"
          },
          {
            "text": "Netflix",
            "url": "https://www.netflix.com/title/80052669"
          },
          {
            "text": "VRV",
            "url": "https://vrv.co/series/G6ZJ48K4Y/No-Game-No-Life"
          },
          {
            "text": "CONtv",
            "url": "https://www.contv.com/details-movie/1323-19619-000/no-game-no-life"
          },
          {
            "text": "Youtube",
            "url": "https://www.youtube.com/playlist?list=PLxSscENEp7JglGq-5PMtbewK96Z_7Au8J"
          }
        ]
      }
    ],
    openingSongs: [],
    endingSongs: [],
    related: [
      {
        type: 'Side story',
        links: [
          {
            statusTag: '',
            title: 'No Game No Life Specials',
            url: 'https://anilist.co/anime/20769',
          },
        ],
      },
      {
        type: 'Source',
        links: [
          {
            statusTag: '',
            title: 'No Game No Life',
            url: 'https://anilist.co/manga/78399',
          },
        ],
      },
      {
        type: 'Prequel',
        links: [
          {
            statusTag: '',
            title: 'No Game No Life Zero',
            url: 'https://anilist.co/anime/21875',
          },
        ],
      },
      {
        type: 'Alternative',
        links: [
          {
            statusTag: '',
            title: 'No Game No Life',
            url: 'https://anilist.co/manga/78397',
          },
        ],
      },
    ],
  };
  let tests = [
    {
      url: 'https://anilist.co/anime/19815/No-Game-No-Life/',
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
