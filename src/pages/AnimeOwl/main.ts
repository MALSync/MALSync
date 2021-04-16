import { pageInterface } from '../pageInterface';

export const AnimeOwl: pageInterface = {
  name: 'AnimeOwl',
  domain: 'https://animeowl.net',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (!url) throw `No url passed`;
    if (
      AnimeOwl.sync.getTitle(url) &&
      j.$('div.player-wrapper').length &&
      url.split('/')[3] !== undefined &&
      url.split('/')[3].length > 0
    ) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (url.split('/')[3] === 'watch' && url.split('/')[3] !== undefined && url.split('/')[3].length > 0) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j
        .$('a.back-tv-show')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(AnimeOwl.sync.getOverviewUrl(url), 4);
    },
    getOverviewUrl(url) {
      return j.$('a.back-tv-show').attr('href') || '';
    },
    getEpisode(url) {
      return parseInt(
        j
          .$('.episodes-list button.active')
          .closest('a')
          .text(),
      );
    },
    nextEpUrl(url) {
      return j
        .$('.episodes-list button.active')
        .parents('div')
        .next()
        .find('a')
        .attr('href');
    },
    getMalUrl(provider) {
      const malid = j.$('[data-mal-id]').attr('data-mal-id');
      if (malid) {
        return `https://myanimelist.net/anime/${malid}`;
      }
      return false;
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('div.post-inner > .anime-title')
        .html()
        .split('<br>')[0]
        .replace(/-\s*$/, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.post-info')
        .first()
        .before(j.html(`<div class="row"><div class="col-12">${selector}</div></div>`));
    },
    getMalUrl(provider) {
      return AnimeOwl.sync.getMalUrl!(provider);
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('#episodes > div.episode-number');
      },
      elementUrl(selector) {
        return selector.find('a').attr('href') || '';
      },
      elementEp(selector) {
        return parseInt(selector.find('a').text());
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (AnimeOwl.isSyncPage(page.url)) {
        page.handlePage(getCurrentUrl());
        return;
      }
      page.handlePage();
    });
  },
};

function getCurrentUrl() {
  return (
    j
      .$('.episodes-list button.active')
      .closest('a')
      .attr('href') || ''
  );
}
