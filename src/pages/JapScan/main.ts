import { pageInterface } from '../pageInterface';

export const JapScan: pageInterface = {
  name: 'JapScan',
  domain: 'https://www.japscan.se',
  languages: ['French'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'lecture-en-ligne') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText($('ol.breadcrumb > li:nth-child(3) > a').first()).trim();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return (
        JapScan.domain +
        (j
          .$('ol.breadcrumb > li:nth-child(3) > a')
          .first()
          .attr('href') || '')
      );
    },
    getEpisode(url) {
      return Number(url.split('/')[5]);
    },
    nextEpUrl(url) {
      const anchorHref =
        j
          .$('div.clearfix > p > a')
          .last()
          .attr('href') || '';

      if (
        j
          .$('div.clearfix > p > span')
          .last()
          .text() === 'Chapitre Suivant' &&
        anchorHref.length
      ) {
        return (
          JapScan.domain +
          (j
            .$('div.clearfix > p > a')
            .last()
            .attr('href') || '')
        );
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div#main > div.card > div.card-body > h1')
        .first()
        .text()
        .replace(/^[a-z]+/gim, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div#main > div.card > div.card-body > h1')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div#chapters_list > div > div.chapters_list.text-truncate');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          JapScan.domain,
        );
      },
      elementEp(selector) {
        return selector
          .find('a')
          .first()
          .attr('href')
          .split('/')[3]
          .match(/\d+/gim);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'manga' ||
        (page.url.split('/')[3] === 'lecture-en-ligne' && j.$('div#image').length)
      ) {
        page.handlePage();
      }
    });
  },
};
