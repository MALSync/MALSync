import { pageInterface } from '../pageInterface';

let episode = 0;
let season = 0;
let huluId: any;
let name: any;
let movie = false;
let nextEp: any;

export const Hulu: pageInterface = {
  name: 'Hulu',
  domain: 'https://www.hulu.com',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'watch') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return name;
    },
    getIdentifier(url) {
      return `${huluId}?s=${season}`;
    },
    getOverviewUrl(url) {
      if (movie) {
        return `${Hulu.domain}/movie/${huluId}`;
      }
      return `${Hulu.domain}/series/${huluId}`;
    },
    getEpisode(url) {
      return episode;
    },
    nextEpUrl(url) {
      return nextEp;
    },
  },
  overview: {
    getTitle(url) {
      const currentSeason = j
        .$(
          'div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value, div.DetailsDropdown > div > div > div.Select__control > div.Select__single-value',
        )
        .text()
        .replace(/\D+/g, '');

      if (typeof currentSeason !== 'undefined' && Number(currentSeason) > 1) return `${name} season ${currentSeason}`;

      return name;
    },
    getIdentifier(url) {
      if (movie) {
        con.log('movie');
        return `${huluId}?s=1`;
      }
      con.log('not a movie');
      return `${huluId}?s=${j
        .$(
          'div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value, div.DetailsDropdown > div > div > div.Select__control > div.Select__single-value',
        )
        .first()
        .text()
        .replace(/\D+/g, '')}`;
    },
    uiSelector(selector) {
      j.$('#LevelTwo__scroll-area > div > div > div.Details__subnav')
        .first()
        .before(j.html(selector));
    },
  },
  init(page) {
    function startCheck() {
      $('html').addClass('miniMAL-hide');
      if (
        page.url.split('/')[3] === 'watch' ||
        page.url.split('/')[3] === 'series' ||
        page.url.split('/')[3] === 'movie'
      ) {
        utils.waitUntilTrue(
          function() {
            if (page.url.split('/')[3] !== 'series') {
              return true;
            }
            return j
              .$(
                'div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value, div.DetailsDropdown > div > div > .Select__control > div.Select__single-value',
              )
              .first()
              .text();
          },
          async function() {
            if (await checkPage()) {
              page.handlePage();
              $('html').removeClass('miniMAL-hide');
              if (page.url.split('/')[3] === 'series') {
                $('body').on(
                  'DOMSubtreeModified',
                  'div.DetailsDropdown > div > div > button.Select__control > div.Select__single-value',
                  function() {
                    page.reset();
                    page.handlePage();
                    $('html').removeClass('miniMAL-hide');
                  },
                );
              }
            }
          },
        );
      }
    }

    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    startCheck();

    utils.urlChangeDetect(function() {
      page.reset();
      con.log('url change');
      startCheck();
    });
  },
};
async function checkPage(): Promise<boolean> {
  const tempId = utils.urlPart(window.location.href, 4);
  const id36 = tempId.substring(tempId.length - 36, tempId.length);

  const reqUrl = `https://discover.hulu.com/content/v3/entity?language=en&eab_ids=${id36}`;

  const response = await api.request.xhr('GET', reqUrl);

  const json = JSON.parse(response.responseText);

  if (!(json.items[0].genre_names.includes('Anime') || json.items[0].genre_names.includes('Animation'))) return false;

  episode = parseInt(json.items[0].number);

  if (json.items[0].season) {
    // if its a series
    huluId = json.items[0].series_id;
    season = parseInt(json.items[0].season);
    name = json.items[0].series_name;
    movie = false;
  } else {
    // if its a movie
    huluId = json.items[0].id;
    season = 1;
    name = json.items[0].name;
    if (window.location.href.split('/')[3] !== 'series') {
      movie = true;
    }
  }
  if (season >= 1 && !movie && window.location.href.split('/')[3] === 'watch') {
    const reqUrl2 = `https://discover.hulu.com/content/v4/hubs/series/${huluId}/season/${season}?offset=0&limit=999&schema=9&referralHost=production`;
    return api.request.xhr('GET', reqUrl2).then(r => {
      const json2 = JSON.parse(r.responseText);
      if (season > 1) {
        episode = episode - json2.items[0].number + 1;
        name = `${name} season ${season}`;
      }
      if (typeof json2.items[episode + 1] !== 'undefined') {
        nextEp = `${Hulu.domain}/watch/${json2.items[episode + 1].id}`;
      } else {
        nextEp = undefined;
      }
      con.log(huluId);
      con.log(name);
      con.log(`episode: ${episode} season: ${season}`);
      return typeof huluId !== 'undefined';
    });
  }
  con.log(huluId);
  con.log(name);
  con.log(`episode: ${episode} season: ${season}`);
  return typeof huluId !== 'undefined';
}
