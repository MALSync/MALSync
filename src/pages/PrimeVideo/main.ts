import { pageInterface } from '../pageInterface';

let thisData: any = null;

export const PrimeVideo: pageInterface = {
  name: 'Amazon Prime Video',
  domain: 'https://www.primevideo.com',
  languages: ['Many'],
  type: 'anime',
  isSyncPage(url) {
    if (thisData && thisData.ep) return true;
    return false;
  },
  sync: {
    getTitle(url) {
      if (thisData && thisData!.title)
        return $('<div/>')
          .html(j.html(thisData!.title))
          .text();
      return '';
    },
    getIdentifier(url) {
      if (thisData && thisData!.id) return thisData!.id;
      throw 'No Id Found';
    },
    getOverviewUrl(url) {
      if (thisData && thisData!.id) return `https://www.primevideo.com/detail/${thisData!.id}`;
      throw 'No Id Found';
    },
    getEpisode(url) {
      if (thisData && thisData!.ep) return thisData!.ep;
      return 1;
    },
  },
  overview: {
    getTitle(url) {
      return PrimeVideo.sync.getTitle(url);
    },
    getIdentifier(url) {
      return PrimeVideo.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('div.av-detail-section > div > h1')
        .first()
        .before(j.html(selector));
    },
  },
  init(page) {
    let epId: any;
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      ready();
    });
    utils.urlChangeDetect(function() {
      ready();
    });
    utils.changeDetect(
      () => {
        if (!j.$('.dv-player-fullscreen').length) ready();
      },
      () => {
        return j.$('.dv-player-fullscreen').length;
      },
    );
    utils.changeDetect(
      async () => {
        if (!epId) {
          con.error('No Episode Id found');
          return;
        }
        thisData = null;
        page.reset();
        $('html').addClass('miniMAL-hide');
        const tempData = await getApi(utils.absoluteLink(epId.vidUrl, PrimeVideo.domain), epId.internalId);
        if (!tempData.genres.includes('av_genre_anime')) {
          con.error('Not an Anime');
          return;
        }

        tempData.ep = null;

        const episodeText = j.$('.dv-player-fullscreen .webPlayer .subtitle').text();
        if (episodeText.length) {
          const temp = episodeText.match(/ep..\d*/gim);
          if (temp !== null) {
            tempData.ep = parseInt(temp[0].replace(/\D+/g, ''));
          }
        }

        thisData = tempData;
        $('html').removeClass('miniMAL-hide');
        page.handlePage();
      },
      () => {
        const tempT = j.$('.dv-player-fullscreen .webPlayer .subtitle').text();
        if (!tempT) return undefined;
        return tempT;
      },
    );
    $('html').on('click', 'a[data-video-type]', async function(e) {
      const vidUrl = j.$(this).attr('href');
      const internalId = j.$(this).attr('data-title-id');
      epId = {
        vidUrl,
        internalId,
      };
    });

    async function ready() {
      thisData = null;
      epId = undefined;
      page.reset();
      $('html').addClass('miniMAL-hide');
      if (utils.urlPart(window.location.href, 3) === 'detail') {
        const tempData = await getApi(window.location.href);
        if (!tempData.genres.includes('av_genre_anime')) {
          con.error('Not an Anime');
          return;
        }

        thisData = tempData;
        $('html').removeClass('miniMAL-hide');
        page.handlePage();
      }
    }
  },
};

function getApi(url, epId = 0) {
  con.log('Request Info', url, epId);
  const data: any = {
    id: undefined,
    title: undefined,
    genres: [],
    ep: null,
    gti: undefined,
  };
  const fns: any[] = [
    // id
    function(e) {
      if (e && e.props && e.props.state && e.props.state.self && Object.keys(e.props.state.self).length) {
        const self: any = Object.values(e.props.state.self)[0];
        if (self && (self.titleType === 'season' || self.titleType === 'movie') && self.compactGTI && self.gti) {
          data.id = self.compactGTI;
          data.gti = self.gti;
        }
      }
    },
    // title, genres
    function(e) {
      if (
        e &&
        e.props &&
        e.props.state &&
        e.props.state.detail &&
        e.props.state.detail.detail &&
        Object.keys(e.props.state.detail.detail).length
      ) {
        // Parent
        let detail;
        if (data.gti && Object.prototype.hasOwnProperty.call(e.props.state.detail.detail, data.gti)) {
          detail = e.props.state.detail.detail[data.gti];
        } else {
          detail = Object.values(e.props.state.detail.detail)[0];
        }

        if (detail && (detail.titleType === 'season' || detail.titleType === 'movie')) {
          if (detail.title) data.title = detail.title;
        }
        if (detail) {
          if (!data.genres.length && detail.genres && detail.genres.length)
            data.genres = detail.genres.map(e2 => e2.id);
        }
        // Episode
        if (epId && Object.prototype.hasOwnProperty.call(e.props.state.detail.detail, epId)) {
          const epDetail = e.props.state.detail.detail[epId];
          if (epDetail.episodeNumber) data.ep = epDetail.episodeNumber;
          if (epDetail.entityType === 'Movie') data.ep = 1;
          if (!data.genres.length && epDetail.genres && epDetail.genres.length)
            data.genres = epDetail.genres.map(e3 => e3.id);
        }
      }
    },
  ];
  return api.request.xhr('GET', url).then(response => {
    const templateMatches = response.responseText.match(/<script type="text\/template">.*(?=<\/script>)/g);

    if (templateMatches && templateMatches.length > 0) {
      const templates = templateMatches.map(e => JSON.parse(e.replace('<script type="text/template">', '')));

      fns.forEach(fn => {
        templates.forEach(fn);
      });
    }

    con.log('result', data);

    return data;
  });
}
