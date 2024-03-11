import { expect } from 'chai';
import { stringify } from 'querystring';
import { RulesClass } from '../../../src/_provider/Search/rulesClass';
import * as Api from '../utils/apiStub';

Api.setGlobals();

describe('Rules', function() {
  const stub = Api.getStub({
    storage: {
      syncMode: 'MAL',
    },
    request: {
      'https://api.malsync.moe/rules/39587': {
        responseText: JSON.stringify({
          last_modified: '2021-02-16',
          page: 'mal',
          rules: [
            {
              from: {
                id: 39587,
                start: 26,
                end: 38,
              },
              to: {
                id: 39587,
                start: 1,
                end: 13,
              },
            },
            {
              from: {
                title: 'Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season',
                id: 39587,
                start: 14,
                end: 25,
              },
              to: {
                title: 'Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season Part 2',
                id: 42203,
                start: 1,
                end: 12,
              },
            },
          ],
        }),
        status: 200,
      },
      'https://api.malsync.moe/rules/10719': {
        responseText: JSON.stringify({
          last_modified: '2021-02-16',
          page: 'mal',
          rules: [
            {
              from: {
                title: 'Boku wa Tomodachi ga Sukunai',
                id: 10719,
                start: 0,
                end: 0,
              },
              to: {
                title: 'Boku wa Tomodachi ga Sukunai Episode 0',
                id: 10897,
                start: 1,
                end: 1,
              },
            },
          ],
        }),
        status: 200,
      },
      'https://api.malsync.moe/rules/32023': {
        responseText: JSON.stringify({
          last_modified: '2021-02-16',
          page: 'mal',
          rules: [
            {
              from: {
                title: 'Bubuki Buranki',
                id: 32023,
                start: 13,
                end: 24,
              },
              to: {
                title: 'Bubuki Buranki: Hoshi no Kyojin',
                id: 33041,
                start: 1,
                end: 12,
              },
            },
          ],
        }),
        status: 200,
      },
    },
  });

  before(function() {
    Api.setGlobals();
    Api.setStub(stub);
  });

  describe('Redirect', function() {
    [
      {
        name: 'No rule matches',
        id: '39587',
        episode: 1,
        result: undefined,
      },
      {
        name: 'Episode offset',
        id: '39587',
        episode: 26,
        result: {
          url: 'https://myanimelist.net/anime/39587',
          offset: -25,
        },
      },
      {
        name: 'Double rule',
        id: '39587',
        episode: 39,
        result: {
          url: 'https://myanimelist.net/anime/42203',
          offset: -38,
        },
      },
      {
        name: 'No rule matches Above',
        id: '39587',
        episode: 51,
        result: undefined,
      },
      {
        name: 'Episode 0',
        id: '10719',
        episode: 0,
        result: {
          url: 'https://myanimelist.net/anime/10897',
          offset: 1,
        },
      },
      {
        name: 'Season 2',
        id: '32023',
        episode: 18,
        result: {
          url: 'https://myanimelist.net/anime/33041',
          offset: -12,
        },
      },
    ].forEach(test => {
      it(test.name, async function() {
        const rules = await new RulesClass(test.id, 'anime').init();
        expect(rules.applyRules(test.episode)).to.eql(test.result);
      });
    });
  });
})
