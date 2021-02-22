import { pageInterface } from '../pageInterface';

export const VIZ: pageInterface = {
  name: 'VIZ',
  domain: 'https://www.viz.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (url.split('/')[3] === 'shonenjump' && url.split('/')[5] === 'chapter') {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a').text();
    },
    getIdentifier(url) {
      const anchorHref = j
        .$('#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a')
        .attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[3];
    },
    getOverviewUrl(url) {
      return (
        VIZ.domain +
        (j.$('#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > a').attr('href') ||
          '')
      );
    },
    getEpisode(url) {
      const episodePart = j
        .$('#product_row > div.bg-lighter-gray.mar-b-md.mar-b-lg--md.chapter_ribbon > div > h3 > span')
        .text();

      if (!episodePart) return NaN;

      const episodeNumberMatches = episodePart.match(/\d+/gim);

      if (!episodeNumberMatches || episodeNumberMatches.length === 0) return NaN;

      return Number(episodeNumberMatches[0]);
    },
  },
  overview: {
    getTitle(url) {
      return j
        .$('#series-intro > div.clearfix.mar-t-md.mar-b-lg > h2')
        .text()
        .trim();
    },
    getIdentifier(url) {
      return url.split('/')[5];
    },
    uiSelector(selector) {
      j.$('#series-intro')
        .first()
        .after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.o_sortable-b,.o_sortable');
      },
      elementUrl(selector) {
        const anchorHref = selector
          .find('a')
          .first()
          .attr('href');

        if (!anchorHref) return '';

        return VIZ.domain + anchorHref.replace(/javascript:tryReadChapter\(\d+,'/gi, '').replace(/'\);/g, '');
      },
      elementEp(selector) {
        const anchorHref = selector
          .find('a')
          .first()
          .attr('href');

        if (!anchorHref || anchorHref.match(/javascript:void\('join to read'\);/)) return NaN;

        let episodePart = selector.find('td > div.disp-id.mar-r-sm').text();

        if (episodePart.length === 0) {
          episodePart = selector
            .find('a')
            .first()
            .text()
            .trim();
        }

        if (!episodePart || episodePart.length === 0) throw 'Join to read';

        const temp = episodePart.match(/\d+/gim);

        if (!temp) return NaN;

        return Number(temp[0]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function() {
      if (
        page.url.split('/')[3] === 'shonenjump' &&
        (page.url.split('/')[5] === 'chapter' || page.url.split('/')[4] === 'chapters')
      ) {
        page.handlePage();
      }
    });
  },
};
