import { pageInterface } from '../pageInterface';

export const HelveticaScans: pageInterface = {
  name: 'HelveticaScans',
  domain: 'https://helveticascans.com',
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
        .$('div.tbtitle div.text a')
        .first()
        .text();
    },
    getIdentifier(url) {
      return url.split('/')[5];
    },
    getOverviewUrl(url) {
      return (
        j
          .$('div.tbtitle div.text a')
          .first()
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      return Number(url.split('/')[8]);
    },
    getVolume(url) {
      return Number(url.split('/')[7]);
    },
    nextEpUrl(url) {
      return j
        .$(
          `div.tbtitle ul.dropdown li a[href='${j
            .$('div.tbtitle div.text a')
            .eq(1)
            .attr('href')}']`,
        )
        .parent()
        .prev()
        .find('a')
        .attr('href');
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
      return url.split('/')[5];
    },
    uiSelector(selector) {
      j.$('h1.title')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.group div.element');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('div.title a')
            .first()
            .attr('href'),
          HelveticaScans.domain,
        );
      },
      elementEp(selector) {
        return parseInt(HelveticaScans.overview!.list!.elementUrl(selector).split('/')[8]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'r' &&
        (page.url.split('/')[4] === 'series' || page.url.split('/')[4] === 'read')
      ) {
        page.handlePage();
      }
    });
  },
};
