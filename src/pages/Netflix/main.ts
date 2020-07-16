import { pageInterface } from '../pageInterface';

let ident: any;
let ses: any;

const genres = [
  '2797624',
  '7424',
  '67614',
  '2653',
  '587',
  '625',
  '79307',
  '9302',
  '79488',
  '452',
  '79448',
  '11146',
  '79440',
  '3063',
  '79543',
  '79427',
  '10695',
  '2729',
  '79329',
  '79572',
  '64256',
  '2951909',
];

function getSeries(page) {
  const videoId = utils.urlPart(window.location.href, 4);
  const reqUrl = `${Netflix.domain}/title/${videoId}`;
  api.request.xhr('GET', reqUrl).then(response => {
    con.log(response);
    let anime = false;
    genres.forEach(function(genre) {
      if (response.responseText.indexOf(`"genres","${genre}"`) !== -1) {
        anime = true;
      }
    });
    if (!anime) {
      con.info('No Anime');
      return;
    }
    ses = getSeason();
    ident = utils.urlPart(response.finalUrl, 4) + ses;
    page.handlePage();
    $('html').removeClass('miniMAL-hide');
  });

  function getSeason() {
    const sesText = j
      .$('.ellipsize-text span')
      .first()
      .text()
      .trim();
    let temp = sesText.match(/^(S|St. )\d+/);
    if (temp !== null) {
      return `?s=${temp[0].replace(/^\D*/, '').trim()}`;
    }

    temp = sesText.match(/\d+/);
    if (temp !== null) {
      return `?s=${temp[0]}`;
    }
    throw 'No Season found';
  }
}

export const Netflix: pageInterface = {
  name: 'Netflix',
  domain: 'https://www.netflix.com',
  database: 'Netflix',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      return `${j
        .$('.ellipsize-text h4')
        .text()
        .trim()} Season ${ses.replace('?s=', '')}`;
    },
    getIdentifier(url) {
      return ident;
    },
    getOverviewUrl(url) {
      return `${Netflix.domain}/title/${Netflix.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const epText = j
        .$('.ellipsize-text span')
        .first()
        .text()
        .trim();
      const temp = epText.match(/\d+$/);
      if (temp !== null) {
        return parseInt(temp[0]);
      }
      return 1;
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      ready();
    });
    utils.urlChangeDetect(function() {
      ready();
    });

    function ready() {
      page.reset();
      $('html').addClass('miniMAL-hide');
      if (utils.urlPart(window.location.href, 3) === 'watch') {
        utils.waitUntilTrue(
          function() {
            return j.$('.ellipsize-text').length;
          },
          function() {
            getSeries(page);
          },
        );
      }
    }
  },
};
