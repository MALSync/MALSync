import { pageInterface } from '../pageInterface';

export const SovetRomantica: pageInterface = {
  name: 'SovetRomantica',
  languages: ['Russian'],
  domain: ['https://sovetromantica.com', 'https://ani.wtf'],
  type: 'anime',
  isSyncPage(url) {
    // Some pages don't have player (https://sovetromantica.com/anime/1418-yamada-kun-to-lv999-no-koi-wo-suru)
    if (j.$('meta[property~="og:video"]').length > 0) return true;
    return false;
  },
  isOverviewPage(url) {
    return false;
  },
  getImage() {
    return $('meta[property~="ya:ovs:poster"]').attr('content');
  },
  sync: {
    getIdentifier(url) {
      // 1440 from https://sovetromantica.com/anime/1440-lv1-maou-to-one-room-yuusha
      return utils.urlPart(url, 4).split('-')[0];
    },
    getOverviewUrl(url) {
      return `https://${window.location.hostname}/anime/${SovetRomantica.sync.getIdentifier(url)}`;
    },
    getTitle(url) {
      return (
        j.$('meta[property~="ya:ovs:original_name"]').attr('content') ||
        j.$('.anime-name > .block--container').text().trim().split(' / ')[1]
      );
    },
    getEpisode(url) {
      const ep_meta = j.$('meta[property~="ya:ovs:episode"]');
      if (ep_meta.length === 0) return 1;
      const ep_str = ep_meta.attr('content');
      return parseInt(ep_str || '1');
    },
    nextEpUrl(url) {
      const ep_next_div = j.$('.episode-active').next();
      if (ep_next_div.length === 0) return undefined;
      const ep_next_url = ep_next_div.find('a').attr('href');
      return utils.absoluteLink(ep_next_url, window.location.origin);
    },
  },
  async init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(function () {
      page.handlePage();
    });
  },
};

// For future, if API will be needed
/*
async function apiCallGet(path: string) {
  con.log('SovetRomantica API Call:', path);
  const xhrResp = await api.request.xhr('GET', `https://service.sovetromantica.com/v1/${path}`);
  con.debug('SovetRomantica API Answer:', xhrResp.responseText);
  const jsonResp = JSON.parse(xhrResp.responseText);
  // Checking if response is error. Error example: {"code": 503,"description": "anime rows are empty"}
  if (!('code' in jsonResp)) {
    con.error('SovetRomantica API Call failed');
    return undefined;
  }
  return jsonResp;
}
*/
