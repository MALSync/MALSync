import { expect } from 'chai';
import { UserList } from '../../../../src/_provider/Local/list';
import { status as statusDef } from '../../../../src/_provider/definitions';
import { setConAndUtils } from '../../utils/singleNetworkStub';

function setGlobals() {
  setConAndUtils();
  (globalThis as any).api = {
    settings: {
      get() {
        return false;
      },
    },
    storage: {
      get() {
        return Promise.resolve(undefined);
      },
    },
  };
}

describe('Local list', () => {
  before(function() {
    setGlobals();
  });

  it('skips malformed (undefined) entries instead of throwing', async () => {
    const list = new UserList(statusDef.All, 'anime');
    const data = {
      'local://crunchyroll/anime/nogamenolife': {
        name: 'No Game No Life',
        image: 'image.jpg',
        tags: '',
        progress: 3,
        score: '',
        status: statusDef.Watching,
      },
      // Simulates a corrupted/partially-migrated storage entry.
      'local://crunchyroll/anime/broken': undefined,
    };

    // prepareData is private - accessed directly to unit test the parsing in isolation.
    const result = await (list as any).prepareData(data, 'anime', statusDef.All);

    expect(result).to.have.length(1);
    expect(result[0].title).to.equal('[L] No Game No Life');
  });
});
