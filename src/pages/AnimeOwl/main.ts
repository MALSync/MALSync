import { pageInterface } from '../pageInterface';

export const AnimeOwl: pageInterface = {
  name: 'AnimeOwl',
  domain: 'https://animeowl.net',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
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
        .$('a.back-tv-show > h5')
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
      if (!utils.urlParam(url, 'ep')) {
        url = getCurrentUrl();
      }
      // @ts-ignore
      return parseInt(utils.urlParam(url, 'ep'));
    },
    nextEpUrl(url) {
      return j
        .$('#episodes > div > a > button.active')
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
        .$('div.post-inner.thin > h4')
        .html()
        .split('<br>')[0]
        .replace(/-\s*$/, '')
        .trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    uiSelector(selector) {
      j.$('div.post-info > div:nth-child(2) > div.row:nth-child(1)')
        .first()
        .after(j.html(`<div class="row"><div class="col-12">${selector}</div></div>`));
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
        return AnimeOwl.sync.getEpisode(AnimeOwl.overview!.list!.elementUrl(selector));
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
      .$('#episodes button.active')
      .closest('a')
      .attr('href') || ''
  );
}
