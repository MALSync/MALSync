import { pageInterface } from '../pageInterface';

export const DisneyPlus: pageInterface = {
  name: 'Disney+',
  domain: 'www.disneyplus.com',
  languages: ['Many'],
  type: 'anime',
  // database: 'DisneyPlus',
  // https://www.disneyplus.com/fr-fr/video/bb5f22e5-26dc-40ae-8630-24e626414392
  isSyncPage(url) {
    return (
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4] === 'video' &&
      typeof url.split('/')[5] !== 'undefined' &&
      url.split('/')[5].length > 0
    );
  },
  // https://www.disneyplus.com/fr-fr/series/bleach-thousand-year-blood-war/4Afet1Q421gy
  isOverviewPage(url) {
    return (
      typeof url.split('/')[4] !== 'undefined' &&
      url.split('/')[4] === 'series' &&
      typeof url.split('/')[5] !== 'undefined' &&
      url.split('/')[5].length > 0 &&
      typeof url.split('/')[6] !== 'undefined' &&
      url.split('/')[6].length > 0
    );
  },
  sync: {
    getTitle() {
      return j
        .$(
          'div.title-bug-area > div.title-bug-container > button.control-icon-btn.title-btn > div.title-field.body-copy',
        )
        .text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    getOverviewUrl() {
      return '';
    },
    getEpisode() {
      const temp = j
        .$(
          'div.title-bug-area > div.title-bug-container > button.control-icon-btn.title-btn > div.subtitle-field',
        )
        .text();

      if (typeof temp === 'undefined') return 0;
      const ep = temp.match(/S[1-9]:E([1-9])/);
      if (ep && ep.length > 1) return Number(ep[1]);
      return 0;
    },
  },
  overview: {
    getTitle() {
      return j.$('h1.h3.padding--bottom-6.padding--right-6.text-color--primary').text();
    },
    getIdentifier(url) {
      return utils.urlPart(url, 5);
    },
    uiSelector(selector) {
      j.$('div.sc-jOVcOr.joRMQj > div.sc-giOsra.blOJuP > div.sc-SFOxd.hvFhdy')
        .first()
        .after(j.html(selector));
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      if (document.title.includes('Code 41')) {
        con.error('404');
        return;
      }
      const categories = j
        .$(
          'p.body-copy.margin--0.text-color--primary > div.metadata.text-color--primary > div.sc-jOBXIr fsZhRo',
        )
        .text();
      if (categories !== 'undefined' && categories.toLowerCase().includes('anime')) {
        page.handlePage();
      }
      con.error('Not an Anime');
    });
  },
};
