import { expect } from "chai";
import { Path, pathToUrl, urlToSlug } from "../../../src/utils/slugs";

const testCases = [
  {
    input: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
    expect: {
      path: {
        type: 'anime',
        slug: '19815',
      },
      url: 'https://myanimelist.net/anime/19815/No_Game_No_Life',
    },
    expectedUrl: 'https://myanimelist.net/anime/19815',
  },
  {
    input: 'https://myanimelist.net/manga/48399/No_Game_No_Life',
    expect: {
      path: {
        type: 'manga',
        slug: '48399',
      },
      url: 'https://myanimelist.net/manga/48399/No_Game_No_Life',
    },
    expectedUrl: 'https://myanimelist.net/manga/48399',
  },
  {
    input: 'https://myanimelist.net/anime/19815',
    expect: {
      path: {
        type: 'anime',
        slug: '19815',
      },
      url: 'https://myanimelist.net/anime/19815',
    },
    expectedUrl: 'https://myanimelist.net/anime/19815',
  },
  {
    input: 'https://myanimelist.net/reviews.php?t=manga',
    expect: {
      url: 'https://myanimelist.net/reviews.php?t=manga',
    },
  },
  {
    input: 'https://anilist.co/anime/19815/No-Game-No-Life/',
    expect: {
      path: {
        type: 'anime',
        slug: 'a:19815',
      },
      url: 'https://anilist.co/anime/19815/No-Game-No-Life/',
    },
    expectedUrl: 'https://anilist.co/anime/19815',
  },
  {
    input: 'https://anilist.co/manga/78399/No-Game-No-Life/',
    expect: {
      path: {
        type: 'manga',
        slug: 'a:78399',
      },
      url: 'https://anilist.co/manga/78399/No-Game-No-Life/',
    },
    expectedUrl: 'https://anilist.co/manga/78399',
  },
  {
    input: 'https://kitsu.app/anime/no-game-no-life',
    expect: {
      path: {
        type: 'anime',
        slug: 'k:no-game-no-life',
      },
      url: 'https://kitsu.app/anime/no-game-no-life',
    },
    expectedUrl: 'https://kitsu.app/anime/no-game-no-life',
  },
  {
    input: 'https://kitsu.app/manga/no-game-no-life-novel',
    expect: {
      path: {
        type: 'manga',
        slug: 'k:no-game-no-life-novel',
      },
      url: 'https://kitsu.app/manga/no-game-no-life-novel',
    },
    expectedUrl: 'https://kitsu.app/manga/no-game-no-life-novel',
  },
  {
    input: 'https://simkl.com/anime/46128/no-game-no-life',
    expect: {
      path: {
        type: 'anime',
        slug: 's:46128',
      },
      url: 'https://simkl.com/anime/46128/no-game-no-life',
    },
    expectedUrl: 'https://simkl.com/anime/46128',
  },
  {
    input: 'local://MangaNato/manga/manga-jz987034',
    expect: {
      path: {
        type: 'manga',
        slug: 'l:MangaNato::manga-jz987034',
      },
      url: '',
    },
    expectedUrl: 'local://MangaNato/manga/manga-jz987034',
  },
  {
    input: 'local://MangaNato/manga/no:game:no:life',
    expect: {
      path: {
        type: 'manga',
        slug: 'l:MangaNato::no%3Agame%3Ano%3Alife',
      },
      url: '',
    },
    expectedUrl: 'local://MangaNato/manga/no:game:no:life',
  },
  {
    input: 'local://MangaNato/manga/no::game::no::life',
    expect: {
      path: {
        type: 'manga',
        slug: 'l:MangaNato::no%3A%3Agame%3A%3Ano%3A%3Alife',
      },
      url: '',
    },
    expectedUrl: 'local://MangaNato/manga/no::game::no::life',
  },
];

describe('Slugs', function() {
  describe('Create', function() {
    testCases.forEach(el => {
      it(el.input, function() {
        expect(urlToSlug(el.input)).to.deep.equal(el.expect);
      })
    })
  });
  describe('Resolve', function() {
    testCases.forEach(el => {
      if (el.expectedUrl) {
        it(el.input, function () {
          expect(pathToUrl(el.expect.path as Path)).to.equal(el.expectedUrl);
        });
      }
    })
  });
});
