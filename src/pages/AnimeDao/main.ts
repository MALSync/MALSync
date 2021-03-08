import { pageInterface } from '../pageInterface';

export const AnimeDao: pageInterface = {
  name: 'AnimeDao',
  domain: 'https://animedao.to',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] === 'view' && url.split('/')[4] !== undefined && url.split('/')[4].length) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'anime' && url.split('/')[4] !== undefined && url.split('/')[4].length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('h2.page_title')
        .text()
        .replace(/episode.*/i, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(AnimeDao.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('#videocontent a[href*="/anime/"]').attr('href') || '', AnimeDao.domain);
    },
    getEpisode(url) {
      const text = j
        .$('h2.page_title')
        .text()
        .toLowerCase();
      if (text.includes('special') || text.includes('ova') || text.includes('movie')) {
        throw new Error('specials are not supported');
      }
      if (!text.includes('episode')) {
        throw new Error('episode is missing');
      }
      return episodePartToEpisode(text);
    },
    nextEpUrl(url) {
      const href = j
        .$('div.btn-group > a > button > span.glyphicon-arrow-right')
        .closest('a')
        .attr('href');
      if (href) return href;
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.animeinfo-div > div > h2 > b')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.animeinfo-div > div > h2')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#eps > div:nth-child(1) > a');
      },
      elementUrl(selector) {
        return utils.absoluteLink(selector.attr('href'), AnimeDao.domain);
      },
      elementEp(selector) {
        try {
          return episodePartToEpisode(selector.text());
        } catch (error) {
          return NaN;
        }
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      page.handlePage();
    });
  },
};

function episodePartToEpisode(string) {
  let temp = [];
  temp = string.match(/(episode)\D?\d+/i);
  if (temp !== null) {
    string = temp[0];
    temp = string.match(/\d+/);
    if (temp !== null) {
      return temp[0];
    }
  }
  return 1;
}
