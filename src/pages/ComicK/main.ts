import { pageInterface } from '../pageInterface';

let jsonData;

export const ComicK: pageInterface = {
  name: 'ComicK',
  domain: 'https://comick.io',
  languages: ['Many'],
  type: 'manga',
  isSyncPage(url) {
    return typeof jsonData.chap !== 'undefined';
  },
  sync: {
    getTitle(url) {
      return jsonData.md_comic.title;
    },
    getIdentifier(url) {
      return jsonData.md_comic.id;
    },
    getOverviewUrl(url) {
      return jsonData.comic_url;
    },
    getEpisode(url) {
      return parseInt(jsonData.chap) || 1;
    },
    getVolume(url) {
      return jsonData.vol || 0;
    },
    getMalUrl(provider) {
      if (jsonData.md_comic.links) {
        if (jsonData.md_comic.links.mal)
          return `https://myanimelist.net/manga/${jsonData.md_comic.links.mal}`;
        if (
          (provider === 'ANILIST' || api.settings.get('syncFallback')) &&
          jsonData.md_comic.links.al
        )
          return `https://anilist.co/manga/${jsonData.md_comic.links.al}`;
      }
      return false;
    },
    readerConfig: [
      {
        condition: '.diagonal-fractions',
        current: {
          selector: '.diagonal-fractions',
          mode: 'text',
          regex: '(\\d+)/(\\d+)',
          group: 1,
        },
        total: {
          selector: '.diagonal-fractions',
          mode: 'text',
          regex: '(\\d+)/(\\d+)',
          group: 2,
        },
      },
      {
        current: {
          selector: '#images-reader-container [id^="page"]',
          mode: 'countAbove',
        },
        total: {
          selector: '#images-reader-container [id^="page"]',
          mode: 'count',
        },
      },
      {
        condition: '[id^="inav"]',
        current: {
          regex: '#page=(\\d+)',
          group: 1,
          mode: 'url',
        },
        total: {
          selector: '[id^="inav"]',
          mode: 'count',
        },
      },
    ],
  },
  overview: {
    getTitle(url) {
      return jsonData.title;
    },
    getIdentifier(url) {
      return jsonData.id;
    },
    uiSelector(selector) {
      j.$(jsonData.selector_position).first().append(j.html(selector));
    },
    getMalUrl(provider) {
      if (jsonData.links) {
        if (jsonData.links.mal) return `https://myanimelist.net/manga/${jsonData.links.mal}`;
        if ((provider === 'ANILIST' || api.settings.get('syncFallback')) && jsonData.links.al)
          return `https://anilist.co/manga/${jsonData.links.al}`;
      }
      return false;
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let interval;

    utils.fullUrlChangeDetect(function () {
      page.reset();
      clearInterval(interval);

      interval = utils.waitUntilTrue(
        function () {
          return j.$('#__MALSYNC__').length;
        },
        function () {
          jsonData = JSON.parse(j.$('#__MALSYNC__').text());
          page.handlePage();
        },
      );
    }, true);
  },
};
