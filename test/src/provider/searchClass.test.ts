import {searchClass} from './../../../src/_provider/searchClass';
import { expect } from 'chai';

describe('Sanitized Titel', function () {
  var titles = {
    'Full Metal Panic! (Dub)': 'Full Metal Panic!',
    'Full Metal Panic! (Sub)': 'Full Metal Panic!',
    'Full Metal Panic! (Sub) ': 'Full Metal Panic!',
    '.hack//G.U. Returner': '.hack//G.U. Returner',
    'No Game No Life BD': 'No Game No Life',
    'VIVIDRED OPERATION (UNCENSORED)': 'VIVIDRED OPERATION',
    'Suber lakoma sekaro' : 'Suber lakoma sekaro',
    'NOUCOME (UNCUT) + OVA': 'NOUCOME + OVA',
    'Fox Spirit Matchmaker (Chinese Audio)': 'Fox Spirit Matchmaker',
    'CODE GEASS Lelouch of the Resurrection ( Code Geass: Fukkatsu no Lelouch )': 'CODE GEASS Lelouch of the Resurrection ( Code Geass: Fukkatsu no Lelouch )',
  }

  Object.keys(titles).forEach(function(key) {
    var title = key;
    var resTitle = titles[key];
    it( title, function () {
      var searchObj = new searchClass(title, 'anime');
      expect(searchObj.getSanitizedTitel()).to.equal(resTitle);
    });
  });

});

describe('Titel Similarity', function () {
  var titles = [
    {title: 'Durarara!!x2 Shou', extTitle: 'Durarara!!x2 Shou', result: true},
    {title: 'TO HEART 2: DUNGEON TRAVELERS', extTitle: 'To Heart 2: Dungeon Travelers', result: true},
    {title: 'Jibaku Shounen Hanako-kun', extTitle: 'Jibaku Shounen Hanako-kun', result: true},
    {title: '3-gatsu no Lion 2nd Season', extTitle: '3-gatsu no Lion 2', result: true},
    {title: 'Boogiepop wa Warawanai (2019)', extTitle: 'Boogiepop wa Warawanai', result: true},
    {title: 'Heroman Specials', extTitle: 'Heroman Specials', result: true},
    {title: 'Risou no Musume Nara Sekai Saikyou Demo Kawaigatte Kuremasuka', extTitle: 'Risou no Musume Nara Sekai Saikyou Demo Kawaigatte Kuremasu ka?', result: true},
    {title: 'Endo and Kobayashi’s Live Commentary on the Villainess', extTitle: 'Manga Grimm Douwa: Chuugoku Akujo Den', result: false},
    {title: 'Liar Liar', extTitle: 'Bonnouji', result: false},
  ]

  titles.forEach(function(res) {
    it( res.title, function () {
      expect(searchClass.similarity(res.extTitle, res.title).same).to.equal(res.result);
    });
  });

});
