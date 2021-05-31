import { pageInterface } from '../pageInterface';
import { ScriptProxy } from '../../utils/scriptProxy';

let seasonData: any;
let episodeData: any;
let nextEpisodeData: any;
let titleName: any;
let titleId: any;

const genres = [
  2797624,
  7424,
  67614,
  2653,
  587,
  625,
  79307,
  9302,
  79488,
  452,
  79448,
  11146,
  79440,
  3063,
  79543,
  79427,
  10695,
  2729,
  79329,
  79572,
  64256,
  2951909,
  6721,
  2867325,
  1522234,
  1623841,
  81216565,
  3073, // anime from the 1970s
  3095, // anime from the 1980s
];

// Define the variable proxy element:
const proxy = new ScriptProxy();
proxy.addCaptureVariable(
  'netflix',
  `
    if (window.hasOwnProperty("netflix")) {
      return netflix.reactContext;
    } else {
      return undefined;
    }
  `,
);

function extractMetadata() {
  const meta: any = proxy.getCaptureVariable('netflix');

  if (!(meta instanceof Object)) {
    throw new Error('Invalid metadata');
  }

  return meta;
}

function getSeries(page) {
  const meta = extractMetadata();
  const videoId = utils.urlPart(window.location.href, 4);
  api.request
    .xhr('GET', `${meta.models.playerModel.data.config.ui.initParams.apiUrl}/metadata?movieid=${videoId}`)
    .then(response => {
      const data = JSON.parse(response.responseText);

      titleId = data.video.id;
      titleName = data.video.title;

      const reqUrl = `${Netflix.domain}/title/${titleId}`;
      api.request.xhr('GET', reqUrl).then(response2 => {
        con.log(response2);
        let anime = false;
        const genresRaw = response2.responseText.match(/"genres":\s*\[.*?\]/i);
        if (genresRaw && genresRaw.length) {
          const genresParsed = JSON.parse(`{${genresRaw[0].replace(/\\/gm, '\\\\')}}`);
          // eslint-disable-next-line no-restricted-syntax
          for (const genre of genresParsed.genres) {
            if (genres.includes(genre.id)) {
              anime = true;
              break;
            }
          }
        }
        if (!anime) {
          con.info('No Anime');
          return;
        }
        if (data.video.type !== 'movie') {
          seasonData = data.video.seasons.find(season => {
            episodeData = season.episodes.find(episode => {
              return episode.id === data.video.currentEpisode;
            });
            return episodeData;
          });
          try {
            nextEpisodeData =
              seasonData.episodes[
                seasonData.episodes.findIndex(episode => {
                  return episode.id === episodeData.id;
                }) + 1
              ];
          } catch (e) {
            nextEpisodeData = undefined;
          }
        } else {
          seasonData = {
            longName: titleName,
            title: titleName,
            seq: 1,
          };
          episodeData = {
            seq: 1,
          };
          nextEpisodeData = undefined;
        }
        page.handlePage();
        $('html').removeClass('miniMAL-hide');
      });
    });
}

export const Netflix: pageInterface = {
  name: 'Netflix',
  domain: 'https://www.netflix.com',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url) {
    return true;
  },
  sync: {
    getTitle(url) {
      if (seasonData.longName !== seasonData.title) {
        return seasonData.title;
      }
      if (seasonData.seq > 1) {
        return `${titleName} season ${seasonData.seq}`;
      }
      return titleName;
    },
    getIdentifier(url) {
      return `${titleId}?s=${seasonData.seq}`;
    },
    getOverviewUrl(url) {
      return `${Netflix.domain}/title/${titleId}`;
    },
    getEpisode(url) {
      return episodeData.seq;
    },
    nextEpUrl(url) {
      if (nextEpisodeData) {
        return `${Netflix.domain}/watch/${nextEpisodeData.id}`;
      }
      return '';
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
            proxy.addProxy(async (caller: ScriptProxy) => {
              getSeries(page);
            });
          },
        );
      }
    }
  },
};
