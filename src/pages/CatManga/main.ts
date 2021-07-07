import { ScriptProxy } from '../../utils/scriptProxy';
import { pageInterface } from '../pageInterface';

let pageData;

// Define the variable proxy element:
const proxy = new ScriptProxy();
proxy.addCaptureVariable(
  'NEXT_DATA',
  `
    if (window.hasOwnProperty("__NEXT_DATA__")) {
      return __NEXT_DATA__;
    } else {
      return undefined;
    }
  `,
);

function extractMetadata() {
  const meta: any = proxy.getCaptureVariable('NEXT_DATA');

  if (!(meta instanceof Object)) {
    throw new Error('Invalid metadata');
  }

  return meta;
}

export const CatManga: pageInterface = {
  name: 'CatManga',
  domain: 'https://catmanga.org',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'series' && typeof url.split('/')[5] !== 'undefined' && url.split('/')[5].length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'series' && typeof url.split('/')[4] !== 'undefined' && url.split('/')[4].length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return pageData.title;
    },
    getIdentifier(url) {
      return pageData.series_id;
    },
    getOverviewUrl(url) {
      return `${CatManga.domain}/series/${CatManga.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5)) || 1;
    },
    nextEpUrl(url) {
      const nextEpNr = CatManga.sync.getEpisode(url) + 1;
      const cur = pageData.chapters.find(el => el.number === nextEpNr);
      if (cur && nextEpNr) {
        return `${CatManga.sync.getOverviewUrl(url)}/${nextEpNr}`;
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return CatManga.sync.getTitle(url);
    },
    getIdentifier(url) {
      return CatManga.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('p:contains("Chapter")')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$(`a[href^="/series/${CatManga.sync.getIdentifier(window.location.href)}/"]`);
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href') || '', CatManga.domain);
      },
      elementEp(selector) {
        return CatManga.sync.getEpisode(CatManga.overview?.list?.elementUrl(selector) || '');
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    }, true);

    function check() {
      if (CatManga.isOverviewPage!(window.location.href) || CatManga.isSyncPage(window.location.href)) {
        proxy.addProxy(async (caller: ScriptProxy) => {
          const nextData = extractMetadata();
          const { buildId } = nextData;
          const seriesId = utils.urlPart(window.location.href, 4);

          const xhr = new XMLHttpRequest();

          xhr.onload = () => {
            if (xhr.status === 200) {
              pageData = JSON.parse(xhr.responseText).pageProps.series;

              page.handlePage();
            }
          };

          xhr.open('GET', `https://catmanga.org/_next/data/${buildId}/series/${seriesId}.json`);
          xhr.send();
        });
      }
    }
  },
};
