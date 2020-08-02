import { pageInterface } from '../pageInterface';

export const JaiminisBox: pageInterface = {
  name: 'JaiminisBox',
  domain: 'https://jaiminisbox.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[4] === 'read') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.tbtitle > div.text > a')
        .first()
        .text();
    },
    getIdentifier(url) {
      return JaiminisBox.sync.getOverviewUrl(url).split('/')[5];
    },
    getOverviewUrl(url) {
      return (
        j
          .$('div.tbtitle > div.text > a')
          .first()
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      return Number(url.split('/')[8]);
    },
    nextEpUrl(url) {
      const nextUrl = j
        .$(
          `div.tbtitle > ul.dropdown > li> a[href='${j
            .$('div.tbtitle > div.text > a')
            .eq(1)
            .attr('href')}']`,
        )
        .parent()
        .prev()
        .find('a')
        .attr('href');
      if (nextUrl) {
        return nextUrl;
      }
      return undefined;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('h1.title')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    uiSelector(selector) {
      j.$('h1.title')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.group > div.element');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('div.title > a')
            .first()
            .attr('href'),
          JaiminisBox.domain,
        );
      },
      elementEp(selector) {
        return parseInt(JaiminisBox.overview!.list!.elementUrl(selector).split('/')[8]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
