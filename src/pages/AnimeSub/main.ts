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
      return j.$('body > div.container.post-anime > div > div:nth-child(1) > h1').text().trim();
    },
    getIdentifier() {
      return getId()!;
    },
    uiSelector(selector) {
      j.$('.viewer').after(j.html(selector));
    },
    getMalUrl(provider) {
      if (provider === 'MAL') {
        const id = malId(provider);
        if (!id) return false;
        return `https://myanimelist.net/anime/${id}`;
      }
      if (provider === 'ANILIST') {
        const id = malId(provider);
        if (!id) return false;
        return `https://anilist.co/anime/${id}`;
      }
      return false;
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    utils.waitUntilTrue(
      function () {
        return j.$('body > div.container.post-anime > div > div:nth-child(1) > h1').length;
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

function malId(provider) {
  let id;
  if (provider === 'MAL') {
    id = j
      .$('div.column.col-12.meta > div > div:nth-last-child(1) > div > span.info > a:nth-child(1)')
      ?.attr('href')
      ?.split('anime/')[1];
  }
  if (provider === 'ANILIST') {
    id = j
      .$('div.column.col-12.meta > div > div:nth-last-child(1) > div > span.info > a:nth-child(2)')
      ?.attr('href')
      ?.split('anime/')[1];
  }
  if (id) return id;
  return undefined;
}
