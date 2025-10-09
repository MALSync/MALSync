import { expect } from 'chai';
import { SearchClass } from '../../../src/_provider/Search/searchClass';

describe('Sanitized Title', function() {
  const titles = {
    'Full Metal Panic! (Dub)': 'Full Metal Panic!',
    'Full Metal Panic! (Sub)': 'Full Metal Panic!',
    'Full Metal Panic! (Sub) ': 'Full Metal Panic!',
    '.hack//G.U. Returner': '.hack//G.U. Returner',
    'No Game No Life BD': 'No Game No Life',
    'VIVIDRED OPERATION (UNCENSORED)': 'VIVIDRED OPERATION',
    'Suber lakoma sekaro': 'Suber lakoma sekaro',
    'NOUCOME (UNCUT) + OVA': 'NOUCOME + OVA',
    'Fox Spirit Matchmaker (Chinese Audio)': 'Fox Spirit Matchmaker',
    'CODE GEASS Lelouch of the Resurrection ( Code Geass: Fukkatsu no Lelouch )':
      'CODE GEASS Lelouch of the Resurrection ( Code Geass: Fukkatsu no Lelouch )',
    'Great Teacher Onizuka (Dubbed)': 'Great Teacher Onizuka',
  };

  Object.keys(titles).forEach(function(key) {
    const title = key;
    const resTitle = titles[key];
    it(title, function() {
      const searchObj = new SearchClass(title, 'anime');
      expect(searchObj.getSanitizedTitle()).to.equal(resTitle);
    });
  });
});

describe('Title Similarity', function() {
  const titles = [
    { title: 'Durarara!!x2 Shou', extTitle: 'Durarara!!x2 Shou', result: true },
    {
      title: 'TO HEART 2: DUNGEON TRAVELERS',
      extTitle: 'To Heart 2: Dungeon Travelers',
      result: true,
    },
    {
      title: 'Jibaku Shounen Hanako-kun',
      extTitle: 'Jibaku Shounen Hanako-kun',
      result: true,
    },
    {
      title: '3-gatsu no Lion 2nd Season',
      extTitle: '3-gatsu no Lion 2',
      result: true,
    },
    {
      title: 'Boogiepop wa Warawanai (2019)',
      extTitle: 'Boogiepop wa Warawanai',
      result: true,
    },
    { title: 'Heroman Specials', extTitle: 'Heroman Specials', result: true },
    {
      title: 'Risou no Musume Nara Sekai Saikyou Demo Kawaigatte Kuremasuka',
      extTitle:
        'Risou no Musume Nara Sekai Saikyou Demo Kawaigatte Kuremasu ka?',
      result: true,
    },
    {
      title: 'Endo and Kobayashi’s Live Commentary on the Villainess',
      extTitle: 'Manga Grimm Douwa: Chuugoku Akujo Den',
      result: false,
    },
    { title: 'Liar Liar', extTitle: 'Bonnouji', result: false },
  ];

  titles.forEach(function(res) {
    it(res.title, function() {
      expect(SearchClass.similarity(res.extTitle, res.title).same).to.equal(
        res.result,
      );
    });
  });
});

const xhrFunction = async function xhr(post, conf, data) {
  return fetch(conf).then(async response => {
    return {
      finalUrl: response.url,
      responseText: await response.text(),
      status: response.status,
    };
  });
};

describe('Mal Search', function() {
  before(function() {
    global.con = require('../../../src/utils/console');
    global.con.log = function() {};
    global.con.error = function() {};
    global.con.info = function() {};
    global.api = {
      request: {
        xhr: xhrFunction,
      },
    };
  });

  xit('Novelplanet', async function () {
    this.timeout(10000);
    const searchObj = new SearchClass(
      'Shuumatsu Nani Shitemasu ka? Isogashii desu ka? Sukutte Moratte Ii desu ka?',
      'novel',
      'Shuumatsu-Nani-Shitemasu-ka-Isogashii-desu-ka-Sukutte-Moratte-Ii-desu-ka',
    );
    searchObj.setPage({
      database: 'Novelplanet',
      type: 'manga',
    });
    expect(await searchObj.malSearch()).to.eql({
      id: 81211,
      url:
        'https://myanimelist.net/manga/81211/Shuumatsu_Nani_Shitemasu_ka_Isogashii_desu_ka_Sukutte_Moratte_Ii_desu_ka',
      offset: 0,
      provider: 'mal',
      similarity: {
        same: true,
        value: 1,
      },
    });
  });

  xit('Kissanime', async function () {
    this.timeout(10000);
    const searchObj = new SearchClass(
      'AZUMANGA DAIOH: GEKIJOU TANPEN',
      'anime',
      'azumanga-daioh-gekijou-tanpen',
    );
    searchObj.setPage({
      database: 'Kissanime',
      type: 'anime',
    });
    expect(await searchObj.malSearch()).to.eql({
      id: 659,
      url: 'https://myanimelist.net/anime/659/Azumanga_Daiou__Gekijou_Tanpen',
      offset: 0,
      provider: 'mal',
      similarity: {
        same: true,
        value: 0.9230769230769231,
      },
    });
  });
});

describe('Page Search', function() {
  // TODO: Reimplement
  return;
  before(function() {
    global.con = require('../../../src/utils/console');
    global.con.log = function() {};
    global.con.error = function() {};
    global.con.info = function() {};
    global.api = {
      request: {
        xhr: xhrFunction,
      },
      settings: {
        get(val) {
          if (val === 'syncMode') return 'MAL';
          throw 'setting not defined';
        },
      },
    };
  });

  it('Novelplanet', async function() {
    this.timeout(10000);
    const searchObj = new SearchClass(
      'No Game No Life',
      'novel',
      'No Game No Life',
    );
    searchObj.setPage({
      database: 'Novelplanet',
      type: 'manga',
    });
    expect(await searchObj.pageSearch()).to.eql({
      url: 'https://myanimelist.net/manga/48399/No_Game_No_Life',
      offset: 0,
      id: 48399,
      provider: 'page',
      similarity: {
        same: true,
        value: 1,
      },
    });
  });

  it('Kissmanga', async function() {
    this.timeout(10000);
    const searchObj = new SearchClass(
      'No Game No Life',
      'manga',
      'No Game No Life',
    );
    searchObj.setPage({
      database: 'Kissmanga',
      type: 'manga',
    });
    expect(await searchObj.pageSearch()).to.eql({
      url: 'https://myanimelist.net/manga/48397/No_Game_No_Life',
      offset: 0,
      id: 48397,
      provider: 'page',
      similarity: {
        same: true,
        value: 1,
      },
    });
  });

  it('Kissanime', async function() {
    this.timeout(10000);
    const searchObj = new SearchClass(
      'Fate/kaleid liner PRISMA ILLYA',
      'anime',
      'Fate-kaleid-liner-Prisma-Illya',
    );
    searchObj.setPage({
      database: 'Kissanime',
      type: 'anime',
    });
    expect(await searchObj.pageSearch()).to.eql({
      url: 'https://myanimelist.net/anime/14829/Fate_kaleid_liner_Prisma☆Illya',
      offset: 0,
      id: 14829,
      provider: 'page',
      similarity: {
        same: true,
        value: 0.9433962264150944,
      },
    });
  });
});

describe('Full Search', function() {
  before(function() {
    global.con = require('../../../src/utils/console');
    global.con.log = function() {};
    global.con.error = function() {};
    global.con.info = function() {};
    global.api = {
      request: {
        xhr: xhrFunction,
      },
      settings: {
        get(val) {
          if (val === 'syncMode') return 'MAL';
          throw 'setting not defined';
        },
      },
    };
  });

  it('Firebase', async function() {
    // TODO: Readd when new novel page is supported
    return;
    this.timeout(10000);
    const searchObj = new SearchClass(
      'No Game No Life',
      'novel',
      'No-Game-No-Life',
    );
    searchObj.setPage({
      database: 'Novelplanet',
      type: 'manga',
    });
    const result = await searchObj.searchForIt();
    expect(result.provider).equal('firebase');
  });

  it('Not Found', async function() {
    this.timeout(10000);
    const searchObj = new SearchClass('Castlevania', 'anime', '17870');
    searchObj.setPage({
      database: 'Zoro',
      type: 'anime',
    });
    const result = await searchObj.searchForIt();
    expect(result.provider).equal('firebase');
  });

  it('Page Search', async function() {
    this.timeout(10000);
    const searchObj = new SearchClass(
      'tales of demons and gods',
      'manga',
      'tales of demons and gods',
    );
    searchObj.setPage({
      type: 'manga',
    });
    searchObj.pageSearch = () => {
      return {
        url: 'https://anilist.co/manga/86707/Yaoshenji/',
        offset: 0,
        provider: 'page',
        similarity: {
          same: true,
          value: 0.9433962264150944,
        },
      };
    };
    const result = await searchObj.searchForIt();
    expect(result.provider).equal('page');
  });
});
