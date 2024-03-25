import { expect } from 'chai';

import { searchSyntax, titleSearch } from '../../../src/utils/quicklinksBuilder';

describe('quicklinksBuilder', function() {

  describe('searchSyntax', function() {
    const title = '[L] No game_no Life³4 1 ! ';
    [
      {
        title: 'No Searchterm',
        search: '--',
        result: '--',
      },
      {
        title: 'Default',
        search: '-{searchterm}-',
        result: '-no%20game_no%20life%C2%B34%201%20!-',
      },
      {
        title: 'Replace Space',
        search: '{searchterm(.)}',
        result: 'no.game_no.life%C2%B34.1.!',
      },
      {
        title: 'No Encoding',
        search: '{searchterm(.)[noEncode]}',
        result: 'no.game_no.life³4.1.!',
      },
      {
        title: 'Option only',
        search: '{searchterm[noEncode]}',
        result: 'no game_no life³4 1 !',
      },
      {
        title: 'No Lowercase',
        search: '{searchterm(+)[noLowercase]}',
        result: 'No+game_no+Life%C2%B34+1+!',
      },
      {
        title: 'No Special Characters',
        search: '{searchterm( )[noSpecial]}',
        result: 'no gameno life4 1',
      },
      {
        title: 'All',
        search: '{searchterm( )[specialReplace]}',
        result: 'no game no life 4 1',
      },
      {
        title: 'All',
        search: '{searchterm(_)[noSpecial,noLowercase,noEncode]}',
        result: 'No_gameno_Life4_1',
      },
    ].forEach(el => {
      it(el.title, function() {
        expect(el.result).to.equal(searchSyntax(el.search, title));
      });
    });
  });

  describe('Title Search', function() {
    const title = 'No game_no Life³4 1 ! ';
    [
      {
        title: 'Default',
        search: '-{searchterm}-',
        result: '-no%20game_no%20life%C2%B34%201%20!-',
      },
      {
        title: 'Plus',
        search: '-{searchtermPlus}-',
        result: '-no+game_no+life%C2%B34+1+!-',
      },
      {
        title: 'Underscore',
        search: '+{searchtermUnderscore}+',
        result: '+no_game_no_life%C2%B34_1_!+',
      },
      {
        title: 'Raw',
        search: '-{searchtermRaw}-',
        result: '-No game_no Life³4 1 !-',
      },
      {
        title: 'Cache Id',
        search: '-{cacheId}-',
        result: '-123-',
      },
    ].forEach(el => {
      it(el.title, function() {
        expect(el.result).to.equal(titleSearch(el.search, title, '123'));
      });
    });

    it('/', function() {
      expect('-no game no Life-').to.equal(titleSearch('-{searchtermRaw}-', 'no game/no Life', '123'));
      expect('-no%20game%2Fno%20life-').to.equal(titleSearch('-{searchterm}-', 'no game/no Life', '123'));
    });
  });
});
