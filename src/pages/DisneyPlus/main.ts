import { pageInterface } from '../pageInterface';

const baseSyncUrl = 'https://www.disneyplus.com/fr-fr/video/';

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
    getTitle(url) {
      return j
        .$(
          'div.title-bug-area > div.title-bug-container > button.control-icon-btn.title-btn > div.title-field.body-copy',
        )
        .text();
    },
    getIdentifier(url) {
      const temp = j.$('head > link[rel="canonical"]').attr('href');
      return temp ? utils.urlPart(temp.toString(), 5) : '' || '';
    },
    getOverviewUrl(url) {
      return j.$('head > link[rel="canonical"]').attr('href') || '';
    },
    getEpisode(url) {
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
    getTitle(url) {
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
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.slick-list > div.slick-track');
      },
      elementUrl(selector) {
        return baseSyncUrl + selector.find('a').first().attr('data-gv2elementvalue') || '';
      },
      elementEp(selector) {
        return (
          Number(
            selector.find('div.slick-slide.slick-active.slick-current').first().attr('data-index'),
          ) + 1 || 0
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(() => {
      ready();
    });
    utils.urlChangeDetect(() => {
      ready();
    });

    function ready() {
      page.reset();
      utils.waitUntilTrue(
        function () {
          const temp = j.$('#unauth-navbar-target > img');
          if (temp.prop('tagName') === 'IMG') {
            return true;
          }
          return false;
        },
        function () {
          const categories = j.$('div.sc-jOBXIr.fsZhRo').text();
          if (categories !== 'undefined' && categories.toLowerCase().includes('anime')) {
            page.handlePage();
          } else con.info('Not an Anime');
        },
      );
    }
  },
};
