import { expect } from 'chai';
import {userlist} from './../../../../src/_provider/AniList/list';

global.con = require('./../../../../src/utils/console');
global.con.log = function() {};
global.api = {
  request: {
    xhr: async function(post, conf, data) {
      conf.data = JSON.parse(conf.data);
      if(!conf.data.variables.page) {
        return {
          responseText: JSON.stringify(require("./api/user.json")),
        };
      }

      return {
        responseText: JSON.stringify(require("./api/list-lastPage.json")),
      };
    }
  },
  settings: {
    get: function() {
      return '';
    }
  }
}

describe('AniList userlist', function () {
  it('Single Page', function () {
    var list = new userlist(7, 'anime')

    list.get().then((list) => {
      expect(list).to.deep.include({
        uid: 112124,
        malId: 40454,
        cacheKey: 40454,
        type: 'anime',
        title:
         'Dungeon ni Deai wo Motomeru no wa Machigatteiru Darou ka III',
        url: 'https://anilist.co/anime/112124',
        watchedEp: 0,
        totalEp: 0,
        status: 6,
        score: 0,
        image:
         'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b112124-fY30NnaklY5W.jpg',
        tags: null,
        airingState: undefined
      });
    });

  });
});
