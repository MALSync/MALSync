import { expect } from 'chai';
import * as Api from '../../utils/apiStub';
import {
  englishSynonymFromMalPageHtml,
  getMalDisplayTitle,
} from '../../../../src/_provider/MyAnimeList_api/helper';

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

  it('uses the first synonym when English is empty', function () {
    api.settings.set('forceEnglishTitles', true);
    expect(
      getMalDisplayTitle({
        title: 'Mushoku Tensei: Isekai Ittara Honki Dasu - Shitsui no Majutsushi-hen',
        alternative_titles: {
          en: '',
          synonyms: [
            'Mushoku Tensei: Depressed Magician Arc',
            'Jobless Reincarnation: Depressed Magician Arc',
          ],
        },
      }),
    ).to.equal('Mushoku Tensei: Depressed Magician Arc');
  });
});

describe('MyAnimeList_api helper englishSynonymFromMalPageHtml', function () {
  it('parses the first synonym from a MAL entry page', function () {
    const html =
      '<span class="dark_text">Synonyms:</span> Mushoku Tensei: Depressed Magician Arc, Jobless Reincarnation: Depressed Magician Arc</div>';
    expect(englishSynonymFromMalPageHtml(html)).to.equal(
      'Mushoku Tensei: Depressed Magician Arc',
    );
  });
});
