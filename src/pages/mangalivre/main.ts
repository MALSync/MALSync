import { pageInterface } from '../pageInterface';

export const mangalivre: pageInterface = {
  name: 'Mangá Livre',
  domain: 'https://mangalivre.net',
  languages: ['Portuguese'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[6] === 'capitulo') {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (
      url.split('/')[3] === 'serie' &&
      url.split('/')[5] !== undefined &&
      url.split('/')[5].length > 0
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.series-title > span.title').text();
    },
    getIdentifier(url) {
      return mangalivre.overview!.getIdentifier(mangalivre.sync.getOverviewUrl(url));
    },
    getOverviewUrl(url) {
      return (
        mangalivre.domain +
        (j.$('div.series-info-popup-container > div > div > div.series-cover > a').attr('href') ||
          '')
      );
    },
    getEpisode(url) {
      return parseInt(j.$('span.current-chapter > em[reader-current-chapter]').text());
    },
    nextEpUrl(url) {
      const href = utils.absoluteLink(
        j.$('ul.chapter-list > li.selected').prev('li').find('a').attr('href'),
        mangalivre.domain,
      );
      if (href) {
        return href;
      }
      return undefined;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('#series-data > div.series-info.touchcarousel > span.series-title > h1')
        .first()
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4) || '';
    },
    uiSelector(selector) {
      j.$('#series-data > div.series-info.touchcarousel > span.series-desc')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      if (document.title.includes('404!')) {
        con.error('404');
        return;
      }
      page.handlePage();
    });
  },
};
