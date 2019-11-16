import { expect } from 'chai';
import {userlist} from './../../../../src/_provider/Kitsu/list';

global.con = require('./../../../../src/utils/console');
global.con.log = function() {};

var responses = {
  user: JSON.stringify(require("./api/user.json")),
  "Page1": JSON.stringify(require("./api/list-Page1.json")),
  "Page2": JSON.stringify(require("./api/list-Page2.json"))
};

var elements = [];

global.api = {}

function getResponse(key) {
  return responses[key];
}



describe('Kitsu userlist', function () {
  before(function () {
    responses = {
      user: JSON.stringify(require("./api/user.json")),
      "Page1": JSON.stringify(require("./api/list-Page1.json")),
      "Page2": JSON.stringify(require("./api/list-Page2.json"))
    };

    elements = [
      {
        malId: '6547',
        uid: '4604',
        cacheKey: '6547',
        kitsuSlug: 'angel-beats',
        type: 'anime',
        title: 'Angel Beats!',
        url: 'https://kitsu.io/anime/angel-beats',
        watchedEp: 13,
        totalEp: 13,
        status: 2,
        score: 10,
        image: 'https://media.kitsu.io/anime/poster_images/4604/large.jpg?1416274148',
        tags: '\n=== MAL Tags ===\nScore: 8.35',
        airingState: undefined
      },
      {
        malId: '9776',
        uid: '5861',
        cacheKey: '9776',
        kitsuSlug: 'a-channel',
        type: 'anime',
        title: 'A-Channel',
        url: 'https://kitsu.io/anime/a-channel',
        watchedEp: 12,
        totalEp: 12,
        status: 2,
        score: 9,
        image: 'https://media.kitsu.io/anime/poster_images/5861/large.jpg?1486237007',
        tags: '\n=== MAL Tags ===\nScore: 7.04',
        airingState: undefined
      }
    ];

    global.api = {
      request: {
        xhr: async function(post, conf, data) {
          if(conf.url.indexOf('/edge/users') !== -1) {
            return {
              responseText: getResponse('user'),
            };
          }

          if(conf.url.indexOf('page[offset]=0') !== -1) {
            return {
              responseText: getResponse('Page1'),
            };
          }

          if(conf.url.indexOf('page[offset]=50') !== -1) {
            return {
              responseText: getResponse('Page2'),
            };
          }

          throw conf.url;
        }
      },
      settings: {
        get: function() {
          return '';
        }
      },
      storage: {
        lang: function() {
          return 'lang';
        },
        get: function(key) {
          if(key == 'kitsuUserId') return undefined;
          return '';
        },
        set: function(key, val) {
        }
      }

    }
  });

  it('Get List', function () {
    var list = new userlist(7, 'anime')

    return list.get().then((list) => {
      expect(list).to.deep.include(elements[0]);
      expect(list).to.deep.include(elements[1]);
    });

  });

  describe('Empty responses', async function () {
    Object.keys(responses).forEach(async function(index) {
      var value = responses[index];
      it( index, async function () {

        var temp = responses[index];
        responses[index] = '';
        try {
          await new userlist(7, 'anime').get();
        } catch (error) {
          responses[index] = temp;
          expect(error.code).to.equal(444)
        }

        responses[index] = temp;

      });
    });
  });

  describe('No json responses', async function () {
    Object.keys(responses).forEach(async function(index) {
      var value = responses[index];
      it( index, async function () {

        var temp = responses[index];
        responses[index] = 'This is not valid json';
        try {
          await new userlist(7, 'anime').get();
        } catch (error) {
          responses[index] = temp;
          expect(error.code).to.equal(406)
        }

        responses[index] = temp;

      });
    });
  });

  it('continueCall', async function () {
    var testArray = [];
    var list = new userlist(7, 'anime', {continueCall: function(list) {
      return new Promise(function(resolve, reject) {
        testArray.push(1);

        expect(list).to.deep.include(elements[0]);

        if(testArray.length > 1){
          expect(list).to.deep.include(elements[1]);
        }else{
          expect(list).to.not.deep.include(elements[1]);
        }

        setTimeout(function(){
          testArray.push(2);
          resolve();
        }, 200);
      });
    }})

    return list.get().then((list) => {
      expect(testArray).to.deep.equal([1,2,1,2,1])
    });
  });

  describe('errorHandling', async function () {
    var list = new userlist();
    it('js', async function () {
      expect(list.errorMessage('This is a error')).to.equal('This is a error');
    });

    it('400', async function () {
      expect(list.errorMessage({code: 400, message: 'Invalid token'})).to.equal('lang');
    });

    it('999', async function () {
      expect(list.errorMessage({code: 999, message: 'Invalid token'})).to.equal('Invalid token');
    });
  });

});
