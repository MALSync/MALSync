import { expect } from 'chai';
import { Single as HybridSingle } from '../../../../src/_provider/MyAnimeList_hybrid/single';
import { UserList as HybridList } from '../../../../src/_provider/MyAnimeList_hybrid/list';
import { search as hybridSearch } from '../../../../src/_provider/MyAnimeList_hybrid/search';
import { Single as ApiSingle } from '../../../../src/_provider/MyAnimeList_api/single';
import { UserList as ApiList } from '../../../../src/_provider/MyAnimeList_api/list';
import { search as apiSearch } from '../../../../src/_provider/MyAnimeList_api/search';

describe('MyAnimeList_hybrid re-exports', function() {
  it('single.ts is MyAnimeList_api/single.ts', function() {
    expect(HybridSingle).to.equal(ApiSingle);
  });

  it('list.ts is MyAnimeList_api/list.ts', function() {
    expect(HybridList).to.equal(ApiList);
  });

  it('search.ts is MyAnimeList_api/search.ts', function() {
    expect(hybridSearch).to.equal(apiSearch);
  });
});
