import { pageInterface } from '../pageInterface';

export const AnimeFever: pageInterface = {
  name: 'AnimeFever',
  domain: 'https://www.animefever.tv',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[5] === 'episode') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.jw-wrapper.jw-reset > div.jw-controls.jw-reset > div.player-episode-info > div > a').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    getOverviewUrl(url) {
      return (
        AnimeFever.domain +
        (j.$('div.jw-wrapper.jw-reset > div.jw-controls.jw-reset > div.player-episode-info > div > a').attr('href') ||
          '')
      );
    },
    getEpisode(url) {
      const urlParts = url.split('/');

      if (!urlParts || urlParts.length === 0) return NaN;

      const episodePart = urlParts[6];

      if (episodePart.length === 0) return NaN;

      const temp = episodePart.match(/episode-\d*/gim);

      if (!temp) return NaN;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const nextEp = j
        .$('section.relative.player-bg > div > a.next-episode')
        .first()
        .attr('href');
      if (!nextEp) return nextEp;
      return utils.absoluteLink(nextEp, AnimeFever.domain);
    },
  },
  overview: {
    getTitle(url) {
      return utils
        .getBaseText(
          $('#ov-anime > div.top-detail.relative > div.uk-width-expand.relative.z-10 > div > h1 > div').first(),
        )
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('#ov-anime > div.top-detail.relative > div.uk-width-expand.relative.z-10 > div > h1')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    function checkPage() {
      page.reset();
      if (
        page.url.split('/')[3] === 'series' &&
        typeof page.url.split('/')[4] !== 'undefined' &&
        page.url.split('/')[4].length > 0
      ) {
        utils.waitUntilTrue(
          function() {
            if (
              j.$('div.jw-wrapper.jw-reset > div.jw-controls.jw-reset > div.player-episode-info > div > a').text() ||
              j.$('#ov-anime > div.top-detail.relative > div.uk-width-expand.relative.z-10 > div > h1 > div').text()
            ) {
              return true;
            }
            return false;
          },
          function() {
            page.handlePage();
          },
        );
      }
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    checkPage();
    utils.urlChangeDetect(function() {
      checkPage();
    });
  },
};
