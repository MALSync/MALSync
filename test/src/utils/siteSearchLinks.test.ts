import { expect } from 'chai';

import { Mkissa } from '../../../src/pages-chibi/implementations/Mkissa/main';
import { titleSearch } from '../../../src/utils/quicklinksBuilder';

const animelon = require('../../../src/pages/Animelon/meta.json') as { search: string };

describe('site search links', function () {
  it('uses the matching anime and manga search pages for Mkissa', function () {
    expect('https://mkissa.to/search/manga?query=attack').to.equal(
      titleSearch(Mkissa.search.anime, 'attack', '1'),
    );
    expect('https://mkissa.to/search/anime?query=attack').to.equal(
      titleSearch(Mkissa.search.manga, 'attack', '1'),
    );
  });

  it('expands Animelon’s search-term placeholder', function () {
    expect('https://www.animelon.com/search?searchTerm=fullmetal%20alchemist').to.equal(
      titleSearch(animelon.search, 'Fullmetal Alchemist', '1'),
    );
  });
});
