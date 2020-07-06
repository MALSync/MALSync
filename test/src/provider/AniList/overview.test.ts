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


describe('AniList overview', function() {
  before(function() {
    setGlobals();
  });
  let resObj = {
    title: 'No Game No Life',
    alternativeTitle: [ 'No Game, No Life', 'ノーゲーム・ノーライフ' ],
    description: "<p>The story of No Game, No Life centers around Sora and Shiro, a brother and sister whose reputations as brilliant NEET (Not in Education, Employment, or Training) hikikomori (shut-in) gamers have spawned urban legends all over the Internet. These two gamers even consider the real world as just another &quot;crappy game.&quot; One day, they are summoned by a boy named &quot;God&quot; to an alternate world. There, God has prohibited war and declared this to be a world where &quot;everything is decided by games&quot; - even national borders. Humanity has been driven back into one remaining city by the other races. Will Sora and Shiro, the good-for-nothing brother and sister, become the &quot;Saviors of Humanity&quot; on this alternate world? &quot;Well, let's start playing.&quot;<br><br><br />\n" +
      '(Source: Anime News Network)</p>',
    image: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/nx19815-bIo51RMWWhLv.jpg',
    characters: [
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/n82523-W3XG4FLDGSQZ.jpg',
        html: '<a href="https://anilist.co/character/82523">Sora</a>'
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/n82525-Le2tc8f6OQ0w.jpg',
        html: '<a href="https://anilist.co/character/82525">Shiro</a>'
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/b82527-vnRsuLvsinP3.png',
        html: '<a href="https://anilist.co/character/82527">Dola, Stephanie</a>'
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/n87887-Qia1XfXbLP4u.jpg',
        html: '<a href="https://anilist.co/character/87887">Jibril</a>'
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/88001.jpg',
        html: '<a href="https://anilist.co/character/88001">Zell, Chlammy</a>'
      },
      {
        img: 'https://s4.anilist.co/file/anilistcdn/character/large/88002.jpg',
        html: '<a href="https://anilist.co/character/88002">Nilvalen, Fiel</a>'
      }
    ],
    statistics: [
      { title: 'Score:', body: 80 },
      { title: 'Favourites:', body: 6930 },
      { title: 'Popularity:', body: 149219 },
      { title: 'Highest rated:', body: '#176' }
    ],
    info: [
      { title: 'Format:', body: 'Tv' },
      { title: 'Episodes:', body: 12 },
      { title: 'Episode Duration:', body: '24 mins' },
      { title: 'Status:', body: 'Finished' },
      { title: 'Start Date:', body: '2014-4-9' },
      { title: 'End Date:', body: '2014-6-25' },
      { title: 'Season:', body: 'Spring 2014' },
      {
        title: 'Studios:',
        body: '<a href="https://anilist.co/studio/11">MADHOUSE</a>'
      },
      { title: 'Source:', body: 'Light novel' },
      {
        title: 'Genres:',
        body: '<a href="https://anilist.co/search/anime?includedGenres=Adventure">Adventure</a>, <a href="https://anilist.co/search/anime?includedGenres=Comedy">Comedy</a>, <a href="https://anilist.co/search/anime?includedGenres=Ecchi">Ecchi</a>, <a href="https://anilist.co/search/anime?includedGenres=Fantasy">Fantasy</a>'
      },
      {
        title: 'External Links:',
        body: '<a href="http://ngnl.jp/">Official Site</a>, <a href="http://www.crunchyroll.com/no-game-no-life">Crunchyroll</a>, <a href="http://www.hulu.com/no-game-no-life">Hulu</a>, <a href="https://twitter.com/ngnl_anime">Twitter</a>, <a href="https://www.animelab.com/shows/no-game-no-life">AnimeLab</a>, <a href="https://www.hidive.com/tv/no-game-no-life">Hidive</a>, <a href="https://www.netflix.com/title/80052669">Netflix</a>, <a href="https://vrv.co/series/G6ZJ48K4Y/No-Game-No-Life">VRV</a>, <a href="https://www.contv.com/details-movie/1323-19619-000/no-game-no-life">CONtv</a>, <a href="https://www.youtube.com/playlist?list=PLxSscENEp7JglGq-5PMtbewK96Z_7Au8J">Youtube</a>'
      }
    ],
    openingSongs: [],
    endingSongs: [],
    related: [
      {
        type: 'Side story',
        links: [{
          "statusTag": "",
          "title": "No Game No Life Specials",
          "url": "https://anilist.co/anime/20769"
        }]
      },
      {
        type: 'Source',
        links: [{
          "statusTag": "",
          "title": "No Game No Life",
          "url": "https://anilist.co/manga/78399",
        }]
      },
      {
        type: 'Prequel',
        links: [{
          "statusTag": "",
          "title": "No Game No Life Zero",
          "url": "https://anilist.co/anime/21875",
        }]
      },
      {
        type: 'Alternative',
        links: [{
          "statusTag": "",
          "title": "No Game No Life",
          "url": "https://anilist.co/manga/78397",
        }]
      }
    ]
  }
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
