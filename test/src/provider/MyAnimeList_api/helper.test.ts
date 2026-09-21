import { expect } from 'chai';
import * as Api from '../../utils/apiStub';
import { getMalDisplayTitle } from '../../../../src/_provider/MyAnimeList_api/helper';

describe('MyAnimeList_api helper getMalDisplayTitle', function () {
  const node = {
    title: 'Shingeki no Kyojin',
    alternative_titles: { en: 'Attack on Titan' },
  };

  beforeEach(function () {
    Api.setGlobals();
    Api.setStub(
      Api.getStub({
        settings: { forceEnglishTitles: false },
      }),
    );
  });

  it('returns default title when force English is off', function () {
    expect(getMalDisplayTitle(node)).to.equal('Shingeki no Kyojin');
  });

  it('returns English title when force English is on', function () {
    api.settings.set('forceEnglishTitles', true);
    expect(getMalDisplayTitle(node)).to.equal('Attack on Titan');
  });

  it('falls back to default title when English is missing', function () {
    api.settings.set('forceEnglishTitles', true);
    expect(getMalDisplayTitle({ title: 'Monster' })).to.equal('Monster');
  });
});
