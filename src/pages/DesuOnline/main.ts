import { pageInterface } from '../pageInterface';

export const DesuOnline: pageInterface = {
  name: 'DesuOnline',
  domain: 'https://desu-online.pl',
  languages: ['Polish'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[3] !== 'anime') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.ts-breadcrumb.bixbox > ol > li:nth-child(2) > a > span').text();
    },
    getIdentifier(url) {
      return DesuOnline.sync.getOverviewUrl(url).split('/')[4];
    },
    getOverviewUrl(url) {
      return j.$('div.ts-breadcrumb.bixbox > ol > li:nth-child(2) > a').attr('href') || '';
    },
    getEpisode(url) {
      const episodePart = url.split('/')[3];

      const temp = episodePart.match(/-odcinek-\d*/gi);

      if (!temp || temp.length === 0) return 1;

      return Number(temp[0].replace(/\D+/g, ''));
    },
    nextEpUrl(url) {
      const href = j
        .$('div.naveps.bignav > div:nth-child(3) > a')
        .first()
        .attr('href');
      if (href) {
        if (DesuOnline.sync.getEpisode(url) < DesuOnline.sync.getEpisode(href)) {
          return href;
        }
      }
      return '';
    },
  },
  overview: {
    getTitle(url) {
      return j.$('div.infox > h1.entry-title').text();
    },
    getIdentifier(url) {
      return url.split('/')[4];
    },
    uiSelector(selector) {
      j.$('div.infox > h1.entry-title')
        .first()
        .before(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('div.bixbox.bxcl.epcheck > div.eplister > ul > li');
      },
      elementUrl(selector) {
        return (
          selector
            .find('a')
            .first()
            .attr('href') || ''
        );
      },
      elementEp(selector) {
        return DesuOnline.sync.getEpisode(
          String(
            selector
              .find('a')
              .first()
              .attr('href'),
          ),
        );
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        (page.url.split('/')[3] === 'anime' &&
          page.url.split('/')[4] !== undefined &&
          page.url.split('/')[4].length &&
          j.$('div.infox > h1.entry-title').length &&
          j.$('div.bixbox.bxcl.epcheck').length) ||
        (j.$('div.ts-breadcrumb.bixbox > ol > li:nth-child(2) > a').length && j.$('div.video-content').length)
      ) {
        page.handlePage();
      }
    });
  },
};
