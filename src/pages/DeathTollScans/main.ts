import { pageInterface } from '../pageInterface';

export const DeathTollScans: pageInterface = {
  name: 'DeathTollScans',
  domain: 'https://reader.deathtollscans.net',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'read') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (j.$('div.comic.info').length) {
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
      return url.split('/')[4];
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
      return Number(url.split('/')[7]);
    },
    getVolume(url) {
      return Number(url.split('/')[6]);
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
        return j.$('div.group div.element');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('div.title a')
            .first()
            .attr('href'),
          DeathTollScans.domain,
        );
      },
      elementEp(selector) {
        return parseInt(DeathTollScans.overview!.list!.elementUrl(selector).split('/')[7]);
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
