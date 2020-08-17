import { pageInterface } from '../pageInterface';

export const KireiCake: pageInterface = {
  name: 'KireiCake',
  domain: 'https://reader.kireicake.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'read') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (j.$('div.list').length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('div.topbar_left h1 a')
        .first()
        .text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return (
        j
          .$('div.topbar_left h1 a')
          .first()
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      return Number(url.split('/')[7]);
    },
    getVolume(url) {
      return Number(url.split('/')[6]);
    },
    nextEpUrl(url) {
      const nextUrl = j
        .$(
          `select option[value='${j
            .$('div.topbar_left form')
            .last()
            .find('select option')
            .first()
            .attr('value')}']`,
        )
        .last()
        .prev()
        .attr('value');
      const CurrentUrl = j
        .$('div.topbar_left form')
        .last()
        .find('select option')
        .first()
        .attr('value');
      if (CurrentUrl !== nextUrl) {
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
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('h1.title')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.list div.element');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('div.title a')
            .first()
            .attr('href'),
          KireiCake.domain,
        );
      },
      elementEp(selector) {
        return parseInt(KireiCake.overview!.list!.elementUrl(selector).split('/')[7]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'series' || page.url.split('/')[3] === 'read') {
        page.handlePage();
      }
    });
  },
};
