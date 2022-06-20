import { pageInterface } from '../pageInterface';

export const Animeworld: pageInterface = {
  name: 'Animeworld',
  domain: 'https://www.animeworld.tv',
  languages: ['Italian'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[4] !== undefined && url.split('/')[4].length) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#anime-title').text().trim();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 4);
    },
    getOverviewUrl(url) {
      return `${Animeworld.domain}/${Animeworld.sync.getIdentifier(url)}`;
    },
    getMalUrl(provider) {
      return new Promise(resolve => {
        resolve(j.$('#mal-button').attr('href') || false);
      });
    },
    getEpisode(url) {
      return parseInt(j.$('a[href*="/play"].active').first().attr('data-episode-num') || '1');
    },
    uiSelector(selector) {
      j.$('span.clearfix').first().after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      // eslint-disable-next-line global-require
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.fullUrlChangeDetect(() => {
      page.reset();
      page.handlePage();
    });
  },
};
