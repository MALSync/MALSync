import { pageInterface } from '../pageInterface';

let jsonData;

export const TsukiMangas: pageInterface = {
  name: 'Tsuki Mangás',
  domain: 'https://www.tsukimangas.com',
  languages: ['Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    return jsonData.isReaderPage;
  },
  sync: {
    getTitle(url) {
      return jsonData.mangaName;
    },
    getIdentifier(url) {
      return jsonData.identifier;
    },
    getOverviewUrl(url) {
      return jsonData.overview_url;
    },
    getEpisode(url) {
      return jsonData.currentChapter;
    },
    nextEpUrl(url) {
      if (jsonData.nextChapter) {
        return jsonData.nextChapter;
      }
      return '';
    },
    getMalUrl(provider) {
      if (jsonData.myanimelistID && jsonData.myanimelistID !== '0') {
        return `https://myanimelist.net/manga/${jsonData.myanimelistID}`;
      }
      if (provider === 'ANILIST' && jsonData.anilistID && jsonData.anilistID !== '0') {
        return `https://anilist.co/manga/${jsonData.anilistID}`;
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return TsukiMangas.sync.getTitle(url);
    },
    getIdentifier(url) {
      return TsukiMangas.sync.getIdentifier(url);
    },
    uiSelector(selector) {
      j.$('h2').after(j.html(selector));
    },
    getMalUrl(provider) {
      return TsukiMangas.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.over23 > div.allbox > div.allcap');
      },
      elementUrl(selector) {
        return utils.absoluteLink(
          selector
            .find('a')
            .first()
            .attr('href'),
          TsukiMangas.domain,
        );
      },
      elementEp(selector) {
        return utils
          .absoluteLink(
            selector
              .find('a')
              .first()
              .attr('href'),
            TsukiMangas.domain,
          )
          .split('/')[7];
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

    let interval;
    let oldJsonString = '';
    let oldJson = {
      currentChapter: null,
      mangaName: null,
    };

    utils.fullUrlChangeDetect(function() {
      page.reset();
      check();
    });

    function check() {
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function() {
          if (j.$('#syncData').length) {
            jsonData = JSON.parse(j.$('#syncData').text());
            const newJsonString = JSON.stringify(jsonData);
            if (
              jsonData.mangaName &&
              newJsonString !== oldJsonString &&
              (oldJson.mangaName !== jsonData.mangaName || oldJson.currentChapter !== jsonData.currentChapter)
            ) {
              oldJson = jsonData;
              oldJsonString = newJsonString;
              return true;
            }
          }
          return false;
        },
        function() {
          if (
            Object.prototype.hasOwnProperty.call(jsonData, 'isReaderPage') &&
            Object.prototype.hasOwnProperty.call(jsonData, 'identifier') &&
            Object.prototype.hasOwnProperty.call(jsonData, 'overview_url')
          ) {
            page.handlePage();
          }
        },
      );
    }
  },
};
