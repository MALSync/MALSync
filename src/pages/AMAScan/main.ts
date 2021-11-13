import { ScriptProxy } from '../../utils/scriptProxy';
import { pageInterface } from '../pageInterface';

const proxy = new ScriptProxy();
proxy.addCaptureVariable(
  'next_chapter',
  `
    if (window.hasOwnProperty('next_chapter')) {
      return { next_chapter };
    } else {
      return undefined;
    }
  `,
);

function extractMetadata() {
  const meta: any = proxy.getCaptureVariable('next_chapter');

  if (!(meta instanceof Object)) {
    throw new Error('Invalid metadata');
  }

  return meta;
}

export const AMAScan: pageInterface = {
  name: 'AMAScan',
  domain: 'https://www.amascan.com',
  languages: ['Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    return utils.urlPart(url, 3) === 'manga' && utils.urlPart(url, 5) !== '';
  },
  isOverviewPage(url) {
    return utils.urlPart(url, 3) === 'manga' && utils.urlPart(url, 5) === '';
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.navbar-collapse > ul.nav > li > a')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return (
        j
          .$('div.navbar-collapse > ul.nav > li > a')
          .first()
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      return Number(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      const meta = extractMetadata();
      const nextChapter = meta.next_chapter;

      if (nextChapter === '') return undefined;

      return nextChapter;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h2.widget-title')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('h2.widget-title')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.chapters > li:not(.btn)');
      },
      elementUrl(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
        return AMAScan.sync.getEpisode(AMAScan.overview!.list!.elementUrl!(selector));
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    if (AMAScan.isSyncPage(window.location.href)) {
      j.$(document).ready(function() {
        proxy.addProxy(async (caller: ScriptProxy) => page.handlePage());
      });
    } else {
      page.handlePage();
    }
  },
};
