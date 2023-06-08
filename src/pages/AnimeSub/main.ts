import { pageInterface } from '../pageInterface';

export const AnimeSub: pageInterface = {
  name: 'AnimeSub',
  domain: 'https://animesub.lt',
  languages: ['Lithuanian'],
  type: 'anime',
  isSyncPage() {
    if (window.location.href.split('/')[6] !== '') return true;
    return false;
  },
  isOverviewPage() {
    if (window.location.href.split('/')[6] === '') return true;
    return false;
  },
  sync: {
    getTitle(url) {
      return AnimeSub.overview!.getTitle!(url);
    },
    getIdentifier() {
      return getId()!;
    },
    getOverviewUrl() {
      return `${window.location.href.split('#')[0]}`;
    },
    getEpisode() {
      return Number(j.$('.scroller ul li.active .info').text().trim().split(' ')[0] || 1);
    },
    uiSelector(selector) {
      j.$('.viewer').after(j.html(selector));
    },
    nextEpUrl(url) {
      const nextEp = j.$('.scroller ul li.active').next();
      if (!nextEp.length) return '';
      return `${AnimeSub.sync.getOverviewUrl(url)}${nextEp.find('a').attr('href')}`;
    },
    getMalUrl(provider) {
      return AnimeSub.overview!.getMalUrl!(provider);
    },
  },
  overview: {
    getTitle() {
      return j.$('.anime-title').text().trim();
    },
    getIdentifier() {
      return getId()!;
    },
    uiSelector(selector) {
      j.$('.viewer').after(j.html(selector));
    },
    getMalUrl(provider) {
      return j.$('a[href^="https://myanimelist.net/anime/"]').attr('href') || '';
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.waitUntilTrue(
      function () {
        return j.$('.anime-title').length;
      },
      function () {
        page.handlePage();
      },
    );
    utils.urlChangeDetect(() => {
      page.handlePage();
    });
  },
};

function getId() {
  const id = j.$('[rel="shortlink"]').attr('href')?.split('p=')[1];
  if (id) return id;
  return undefined;
}
