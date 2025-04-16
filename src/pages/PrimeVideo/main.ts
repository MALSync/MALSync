import { PageInterface } from '../pageInterface';

let thisData: any = null;

const EPISODETEXT = '.dv-player-fullscreen .webPlayerSDKContainer .atvwebplayersdk-subtitle-text';

export const PrimeVideo: PageInterface = {
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
      if (thisData && thisData!.title) return utils.htmlDecode(thisData!.title);
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
      j.$('div.av-detail-section > div > h1').first().before(j.html(selector));
    },
  },
  init(page) {
    let epId: any;
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      ready();
    });
    utils.urlChangeDetect(function () {
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
        const tempData = await getApi(utils.absoluteLink(epId.vidUrl, PrimeVideo.domain));
        if (!tempData.genres.includes('av_genre_anime')) {
          con.error('Not an Anime');
          return;
        }

        const episodeText = j.$(EPISODETEXT).text();
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
        const tempT = j.$(EPISODETEXT).parent().text();
        if (!tempT) return undefined;
        return tempT;
      },
    );
    $('html').on('click', 'a', async function (e) {
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
      if (
        utils.urlPart(window.location.href, 3) === 'detail' ||
        utils.urlPart(window.location.href, 5) === 'detail'
      ) {
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

function getApi(url) {
  con.log('Request Info', url);
  const data: any = {
    id: undefined,
    gti: undefined,
    title: undefined,
    genres: [],
    ep: null,
    epMeta: {
      id: undefined,
      gti: undefined,
    },
  };
  const fns: any[] = [
    // id
    function (e) {
      if (
        e &&
        e.props &&
        e.props.state &&
        e.props.state.self &&
        Object.keys(e.props.state.self).length
      ) {
        const current: any = Object.values(e.props.state.self).find((el: any) => {
          return Boolean(el.compactGTI && url.toLowerCase().includes(el.compactGTI.toLowerCase()));
        });
        if (!current) return;

        con.m('Self').log(current);
        if (current.titleType === 'season') {
          data.id = current.compactGTI;
          data.gti = current.gti;
        } else if (current.titleType === 'movie') {
          data.id = current.compactGTI;
          data.gti = current.gti;
          if (j.$(EPISODETEXT).length) {
            data.epMeta.id = current.compactGTI;
            data.epMeta.gti = current.gti;
          }
        } else if (current.titleType === 'episode') {
          data.epMeta.id = current.compactGTI;
          data.epMeta.gti = current.gti;
          const parent: any = Object.values(e.props.state.self).find((el: any) =>
            Boolean(el.titleType === 'season' || el.titleType === 'movie'),
          );
          if (parent) {
            con.m('Self').m('Parent').log(parent);
            data.id = parent.compactGTI;
            data.gti = parent.gti;
          }
        }
      }
    },
    // title, genres
    function (e) {
      if (data.gti && e && e.props && e.props.state && e.props.state.detail) {
        // Parent
        let detail;

        // Episode
        if (
          data.epMeta.gti &&
          (Object.prototype.hasOwnProperty.call(
            e.props.state.detail.headerDetail,
            data.epMeta.gti,
          ) ||
            Object.prototype.hasOwnProperty.call(e.props.state.detail.detail, data.epMeta.gti))
        ) {
          let epDetail;
          if (
            Object.prototype.hasOwnProperty.call(e.props.state.detail.headerDetail, data.epMeta.gti)
          ) {
            epDetail = e.props.state.detail.headerDetail[data.epMeta.gti];
          } else {
            epDetail = e.props.state.detail.detail[data.epMeta.gti];
          }
          con.log('Ep Details', epDetail);
          if (epDetail.episodeNumber) data.ep = epDetail.episodeNumber;
          if (epDetail.entityType === 'Movie') data.ep = 1;
        }

        if (
          e.props.state.detail.headerDetail &&
          Object.keys(e.props.state.detail.headerDetail).length &&
          Object.prototype.hasOwnProperty.call(e.props.state.detail.headerDetail, data.gti)
        ) {
          detail = e.props.state.detail.headerDetail[data.gti];
          con.log('headerDetail', detail);
        } else if (
          e.props.state.detail.detail &&
          Object.keys(e.props.state.detail.detail).length &&
          Object.prototype.hasOwnProperty.call(e.props.state.detail.detail, data.gti)
        ) {
          detail = e.props.state.detail.detail[data.gti];
          con.log('detail', detail);
        } else {
          return;
        }

        if (
          detail &&
          (detail.titleType.toLowerCase() === 'season' ||
            detail.titleType.toLowerCase() === 'movie')
        ) {
          if (detail.title) data.title = detail.title;
        }
        if (detail) {
          if (!data.genres.length && detail.genres && detail.genres.length)
            data.genres = detail.genres.map(e2 => e2.id);
        }
      }
    },
  ];
  return api.request.xhr('GET', url).then(response => {
    const templateMatches = response.responseText.match(
      /<script type="text\/template">.*(?=<\/script>)/g,
    );

    if (templateMatches && templateMatches.length > 0) {
      const templates = templateMatches.map(e =>
        JSON.parse(e.replace('<script type="text/template">', '')),
      );

      fns.forEach(fn => {
        templates.forEach(fn);
      });
    }

    con.log('result', data);

    return data;
  });
}
