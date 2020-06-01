import { pageInterface } from '../pageInterface';

export const Scantrad: pageInterface = {
  name: 'Scantrad',
  domain: 'https://scantrad.net/',
  type: 'manga',
  isSyncPage(url) {
    return url.split('/')[3] === 'mangas';
  },
  sync: {
    getTitle(url) {
      return j
        .$('.tl-titre')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(Scantrad.sync.getOverviewUrl(url), 3);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(
        j
          .$('.tl-titre')
          .first()
          .attr('href'),
        Scantrad.domain,
      );
    },
    getEpisode(url) {
      return parseInt(utils.urlPart(url, 5));
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('.titre')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return Scantrad.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      selector.appendTo(j.$('.info'));
    },
  },
  init(page) {
    api.storage.addStyle(require('./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};
