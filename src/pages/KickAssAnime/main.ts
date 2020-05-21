import { pageInterface } from '../pageInterface';

export const KickAssAnime: pageInterface = {
  name: 'KickAssAnime',
  domain: 'https://www.kickassanime.rs',
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[5] === null) {
      return false;
    }
    return true;
  },
  sync: {
    getTitle(url) {
      return utils.getBaseText($('#animeInfoTab > a'));
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return `${KickAssAnime.domain}/anime/${KickAssAnime.sync.getIdentifier(
        url,
      )}`;
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[5];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/episode-\d*/gi);

      if (!temp || temp.length === 0) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  overview: {
    getTitle(url) {
      return j.$('h1.title').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      selector.insertAfter(j.$('div.anime-info.border.rounded.mb-3').first());
    },
  },
  init(page) {
    if (document.title === 'Just a moment...') {
      con.log('loading');
      page.cdn();
      return;
    }
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'anime') {
        page.handlePage();
      }
    });
  },
};
