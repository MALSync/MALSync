import { ScriptProxy } from '../../utils/scriptProxy';
import { pageInterface } from '../pageInterface';

let handleInterval;
const proxy = new ScriptProxy();
proxy.addCaptureVariable(
  'episodesInformation',
  `
    if (!window.fetchOverride) {
      window.malsyncData = {};

      var originalFetch = fetch;
      fetch = (input, init) => originalFetch(input, init)
        .then(response => {
          try {
            let url = input.url || input;
            if (url.includes('/api/')) {
              res = response.clone();
              res.json().then(data => {
                if (data && data.type && data.type === 'VOD' && data.id) {
                  window.malsyncData[data.id] = data;
                }
              });
            }

          } catch (e) {
            console.error('MALSYNC', e);
          }

          return response;
        });

      console.log('MALSYNC', "Fetch override added.");
      window.fetchOverride = true;
    }

    if (window.hasOwnProperty("malsyncData")) {
      return window.malsyncData;
    } else {
      return undefined;
    }
  `,
);

export const Hidive: pageInterface = {
  name: 'Hidive',
  domain: 'https://www.hidive.com',
  languages: [
    'English',
    'Spanish',
    'Portuguese',
    'French',
    'German',
    'Arabic',
    'Italian',
    'Russian',
  ],
  type: 'anime',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'video';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'season' || utils.urlPart(url, 3) === 'playlist';
  },
  sync: {
    getTitle(url) {
      const info = epInfo(videoId());
      if (!info) throw new Error("Couldn't find episode information");

      if (!info.episodeInformation) return info.title;

      return '';
    },
    getIdentifier(url) {
      const info = epInfo(videoId());
      if (!info) throw new Error("Couldn't find episode information");

      if (info.episodeInformation && info.episodeInformation.season) {
        return String(info.episodeInformation.season);
      }

      return String(info.id);
    },
    getOverviewUrl(url) {
      const info = epInfo(videoId());
      if (!info) throw new Error("Couldn't find episode information");

      if (info.episodeInformation && info.episodeInformation.season) {
        return utils.absoluteLink(`/season/${info.episodeInformation.season}`, Hidive.domain);
      }

      const playlist = utils.urlParam(window.location.href, 'playlistId');

      if (playlist) {
        return utils.absoluteLink(`/playlist/${playlist}`, Hidive.domain);
      }

      return window.location.href;
    },
    getEpisode(url) {
      const info = epInfo(videoId());
      if (!info) throw new Error("Couldn't find episode information");

      if (!info.episodeInformation) return 1;

      return getEpisodeNumber(info.title);
    },
  },

  overview: {
    getTitle(url) {
      return j.$('.r-bhdy8w, .r-1its8ov').text().trim();
    },
    getIdentifier(url) {
      return String(utils.urlPart(url, 4));
    },
    uiSelector(selector) {
      j.$('.simple-carousel').first().before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.simple-carousel .content-pager__item');
      },
      elementUrl(selector) {
        return selector.find('a').attr('href') || '';
      },
      elementEp(selector) {
        const temp = selector.find('.card-title__title').text().trim();
        return getEpisodeNumber(temp);
      },
    },
  },

  init(page) {
    proxy.addProxy();
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    j.$(document).ready(() => handle());
    utils.urlChangeDetect(() => handle());
    function handle() {
      page.reset();
      clearInterval(handleInterval);
      if (Hidive.isSyncPage(window.location.href)) {
        const video = videoId();
        handleInterval = utils.waitUntilTrue(
          () => {
            proxy.addProxy();
            return epInfo(video);
          },
          () => page.handlePage(),
          1000,
        );
      } else if (Hidive.isOverviewPage!(window.location.href)) {
        handleInterval = utils.waitUntilTrue(
          () => Hidive.overview!.getTitle(window.location.href),
          () => page.handlePage(),
        );
      }
    }
  },
};

function videoId() {
  return Number(utils.urlPart(window.location.href, 4));
}

function epInfo(videoIdentifier: number) {
  const eps = proxy.getCaptureVariable('episodesInformation');
  if (!eps || !eps[videoIdentifier]) return undefined;
  con.m('Episode').m(videoIdentifier).log(eps[videoIdentifier]);
  return eps[videoIdentifier];
}

function getEpisodeNumber(title) {
  const temp = title.match(/E(\d+)/i);
  if (!temp) return 0;
  return Number(temp[1]);
}
