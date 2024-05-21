import { pageInterface } from '../pageInterface';
import { ScriptProxy } from '../../utils/scriptProxy';
import { SafeError } from '../../utils/errors';

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
const proxy = new ScriptProxy('Netflix');

async function extractMetadata() {
  const meta: any = await proxy.getData();

  if (!(meta instanceof Object)) {
    throw new Error('Invalid metadata');
  }

  return meta;
}

async function getSeries(page) {
  const meta = await extractMetadata();
  const videoId = utils.urlPart(window.location.href, 4);
  api.request
    .xhr(
      'GET',
      `https://${meta.models.services.data.memberapi.hostname}${meta.models.services.data.memberapi.path[0]}/metadata?movieid=${videoId}`,
    )
    .then(response => {
      const data = JSON.parse(response.responseText);

      if (!data || !data.video) {
        throw new SafeError('no data found');
      }

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
        if (data.video.type !== 'movie' && data.video.seasons) {
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
  async init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    await proxy.injectScript();

    j.$(document).ready(function () {
      ready();
    });
    utils.urlChangeDetect(function () {
      ready();
    });

    function ready() {
      page.reset();
      $('html').addClass('miniMAL-hide');
      if (utils.urlPart(window.location.href, 3) === 'watch') {
        utils.waitUntilTrue(
          function () {
            return j.$('[data-videoid]').length;
          },
          function () {
            getSeries(page);
          },
        );
      }
    }
  },
};
