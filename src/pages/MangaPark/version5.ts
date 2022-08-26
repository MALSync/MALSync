import { pageInterface } from '../pageInterface';
import { ScriptProxy } from '../../utils/scriptProxy';

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

let nextData;

export const version5: pageInterface = {
  name: 'MangaPark',
  domain: 'https://mangapark.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    return Boolean(
      url.split('/')[3] === 'title' &&
        typeof url.split('/')[5] !== 'undefined' &&
        url.split('/')[5].length > 0,
    );
  },
  isOverviewPage(url) {
    if (
      url.split('/')[3] === 'title' &&
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4].length > 0
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return nextData.props.pageProps.dehydratedState.queries[0].state.data.data.comicNode.data
        .name;
    },
    getIdentifier(url) {
      return nextData.props.pageProps.dehydratedState.queries[0].state.data.data.comicNode.data.id.toString();
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('.comic-detail > h3 > a').attr('href'), version5.domain);
    },
    getEpisode(url) {
      return parseInt(nextData.props.pageProps.dehydratedState.queries[0].state.data.data.serial);
    },
    getVolume(url) {
      if (nextData.props.pageProps.dehydratedState.queries[0].state.data.data.volume) {
        return parseInt(nextData.props.pageProps.dehydratedState.queries[0].state.data.data.volume);
      }
      return NaN;
    },
    nextEpUrl(url) {
      const href = j.$('a:contains("Next ▶")').attr('href');

      if (href) {
        return utils.absoluteLink(href, version5.domain);
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return nextData.props.pageProps.dehydratedState.queries[0].state.data.data.name;
    },
    getIdentifier(url) {
      return nextData.props.pageProps.dehydratedState.queries[0].state.data.data.id.toString();
    },
    uiSelector(selector) {
      j.$('div.marking-section').first().before(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./version5.less').toString(),
    );
    proxy.addProxy(async (caller: ScriptProxy) => {
      const meta: any = proxy.getCaptureVariable('NEXT_DATA');

      if (!(meta instanceof Object)) {
        throw new Error('Invalid metadata');
      }

      nextData = meta;

      if (version5.isSyncPage(window.location.href)) {
        utils.waitUntilTrue(
          function () {
            if (j.$('a:contains("Next ▶")').length) {
              return true;
            }
            return false;
          },
          function () {
            page.handlePage();
          },
        );
      } else {
        page.handlePage();
      }
    });
  },
};
