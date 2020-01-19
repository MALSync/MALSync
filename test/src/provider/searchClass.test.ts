import {searchClass} from './../../../src/_provider/searchClass';
import { expect } from 'chai';

describe('sanitized Titel', function () {
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
