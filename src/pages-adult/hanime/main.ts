import { pageInterface } from '../../pages/pageInterface';

export const hanime: pageInterface = {
  name: 'hanime',
  domain: 'https://hanime.tv',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'videos' && url.split('/')[4] === 'hentai') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h1.tv-title')
        .text()
        .replace(/ ([^a-z]*)$/gim, '')
        .trim();
    },
    getIdentifier(url) {
      const urlPart5 = utils.urlPart(url, 5);

      if (!urlPart5) return '';

      return urlPart5.replace(/-([^a-z]*)$/gim, '').trim();
    },
    getOverviewUrl(url) {
      const overviewPart = utils.urlPart(url, 5);

      if (!overviewPart) return '';

      const temp = overviewPart.match(/-([^a-z]*)$/gim);
      if (temp !== null) {
        return `${hanime.domain}/videos/hentai/${hanime.sync.getIdentifier(url)}-1`;
      }
      return `${hanime.domain}/videos/hentai/${hanime.sync.getIdentifier(url)}`;
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = utils.urlPart(url, 5);

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/-([^a-z]*)$/gim);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (page.url.split('/')[3] === 'videos' && page.url.split('/')[4] === 'hentai') {
        utils.waitUntilTrue(
          function() {
            return j.$('h1.tv-title').text();
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
    utils.urlChangeDetect(function() {
      page.reset();
      if (page.url.split('/')[3] === 'videos' && page.url.split('/')[4] === 'hentai') {
        utils.waitUntilTrue(
          function() {
            return j.$('h1.tv-title').text();
          },
          function() {
            page.handlePage();
          },
        );
      }
    });
  },
};
