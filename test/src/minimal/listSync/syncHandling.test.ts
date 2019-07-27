import { expect } from 'chai';
import { getType } from './../../../../src/minimal/minimalApp/listSync/syncHandler';


describe('Sync Handling', function () {
  describe('getType', function () {
    it('Myanimelist', function () {
      expect(getType('https://myanimelist.net/anime/19815/No_Game_No_Life')).to.equal("MAL");
    });
    it('AniList', function () {
      expect(getType('https://anilist.co/anime/19815/No-Game-No-Life/')).to.equal("ANILIST");
    });
    it('Kitsu', function () {
      expect(getType('https://kitsu.io/anime/no-game-no-life')).to.equal("KITSU");
    });
    it('Simkl', function () {
      expect(() => getType('https://simkl.com/anime/46128/no-game-no-life')).to.throw();
    });
    it('Random', function () {
      expect(() => getType('Random')).to.throw();
    });
  });

});
