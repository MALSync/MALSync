import { pageInterface } from '../pageInterface';

export const serimanga: pageInterface = {
  name: 'serimanga',
  domain: 'https://serimanga.com',
  languages: ['Turkish'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[5] !== undefined && url.split('/')[5].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText($('#reader > div.read-top-menu > div.rtm-logo > a.back.text-white')).trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    getOverviewUrl(url) {
      return j.$('#reader > div.read-top-menu > div.rtm-logo > a.back.text-white').attr('href') || '';
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
    nextEpUrl(url) {
      return j
        .$('#chapterButtons2 > div > div:nth-child(2) > a')
        .first()
        .attr('href');
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.seri-img > div > div > div.name')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('div.sub-top-text')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'manga') {
        page.handlePage();
      }
    });
  },
};
