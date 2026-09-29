import { expect } from 'chai';
import { UserList } from '../../../../src/_provider/AniList/list';
import { setConAndUtils, createProviderApi } from '../../utils/singleNetworkStub';

function setGlobals() {
  setConAndUtils();
  (globalThis as any).api = createProviderApi({
    tokenKey: 'anilistToken',
    xhr: async () => {
      throw new Error('Network should not be hit by these tests');
    },
  });
}

const validEntry = {
  status: 'CURRENT',
  startedAt: { year: null, month: null, day: null },
  completedAt: { year: null, month: null, day: null },
  repeat: 0,
  score: 0,
  progress: 5,
  progressVolumes: 0,
  notes: '',
  media: {
    siteUrl: 'https://anilist.co/anime/21/One-Piece',
    id: 21,
    idMal: 21,
    episodes: 1000,
    chapters: null,
    volumes: null,
    status: 'RELEASING',
    averageScore: 87,
    coverImage: { large: 'large.jpg', extraLarge: 'extraLarge.jpg' },
    bannerImage: 'banner.jpg',
    title: { userPreferred: 'One Piece' },
  },
};

describe('AniList list', () => {
  before(function() {
    setGlobals();
  });

  it('skips entries with a null media node instead of throwing', async () => {
    const list = new UserList(1, 'anime');
    const data = [validEntry, { ...validEntry, media: null }, null, undefined];

    // prepareData is private - accessed directly to unit test the parsing in isolation.
    const result = await (list as any).prepareData(data, 'anime');

    expect(result).to.have.length(1);
    expect(result[0].uid).to.equal(21);
    expect(result[0].title).to.equal('One Piece');
  });

  it('returns an empty list without throwing when every entry is malformed', async () => {
    const list = new UserList(1, 'anime');
    const result = await (list as any).prepareData([{ media: null }, null], 'anime');

    expect(result).to.have.length(0);
  });
});
