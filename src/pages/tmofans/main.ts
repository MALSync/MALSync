import { pageInterface } from '../pageInterface';

export const tmofans: pageInterface = {
  name: 'tmofans',
  domain: ['https://lectortmo.com', 'https://tmofans.com'],
  languages: ['Spanish'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'viewer' && url.split('/')[4] !== undefined && url.split('/')[4].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('#app > section:nth-child(2) > div > div > h1')
        .text()
        .trim();
    },
    getIdentifier(url) {
      const identifierAnchorHref = j
        .$('nav.navbar > div > div:nth-child(2) > a')
        .last()
        .attr('href');

      if (!identifierAnchorHref) return '';

      return identifierAnchorHref.split('/')[6];
    },
    getOverviewUrl(url) {
      return (
        j
          .$('nav.navbar > div > div:nth-child(2) > a')
          .last()
          .attr('href') || ''
      );
    },
    getEpisode(url) {
      const episodePart = utils.getBaseText($('#app > section:nth-child(2) > div > div > h2').first()).trim();
      if (episodePart.length) {
        const temp = episodePart.match(/Capítulo *\d*/gim);
        if (temp !== null) {
          return temp[0].replace(/\D+/g, '');
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return utils.getBaseText($('h1.element-title.my-2').first()).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 6) || '';
    },
    uiSelector(selector) {
      j.$('header.container-fluid')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] === 'library' &&
          page.url.split('/')[4] !== undefined &&
          page.url.split('/')[4].length > 0) ||
        page.url.split('/')[3] === 'viewer'
      ) {
        page.handlePage();
      }
    });
  },
};
