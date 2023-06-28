import { pageInterface } from '../pageInterface';

export const VIZ: pageInterface = {
  name: 'VIZ',
  domain: 'https://www.viz.com',
  languages: ['English'],
  type: 'manga',
  isSyncPage(url) {
    if (
      (url.split('/')[3] === 'shonenjump' || url.split('/')[3] === 'vizmanga') &&
      url.split('/')[5] === 'chapter'
    ) {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if (
      (url.split('/')[3] === 'shonenjump' || url.split('/')[3] === 'vizmanga') &&
      url.split('/')[4] === 'chapters'
    ) {
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      return j.$('div.chapter_ribbon > div > h3 > a').text();
    },
    getIdentifier(url) {
      const anchorHref = j.$('div.chapter_ribbon > div > h3 > a').attr('href');

      if (!anchorHref) return '';

      return anchorHref.split('/')[3];
    },
    getOverviewUrl(url) {
      return utils.absoluteLink(j.$('div.chapter_ribbon > div > h3 > a').attr('href'), VIZ.domain);
    },
    getEpisode(url) {
      const episodePart = j.$('div.chapter_ribbon > div > h3 > span').text();

      if (!episodePart) return NaN;

      const episodeNumberMatches = episodePart.match(/\d+/gim);

      if (!episodeNumberMatches || episodeNumberMatches.length === 0) return NaN;

      return Number(episodeNumberMatches[0]);
    },
    nextEpUrl(url) {
      return utils.absoluteLink(
        j.$('#end_page_next_up a[data-event*="Next Chapter"]').attr('href'),
        VIZ.domain,
      );
    },
  },
  overview: {
    getTitle(url) {
      return j.$('#series-intro > div > h2').text().trim();
    },
    getIdentifier(url) {
      return url.split('/')[5];
    },
    uiSelector(selector) {
      j.$('#series-intro').first().after(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$(
          '.section_chapters #chpt_rows .o_sortable-b, .section_chapters #chpt_rows .o_sortable',
        );
      },
      elementUrl(selector) {
        const anchorHref = selector.find('a').first().attr('href');

        if (!anchorHref) return '';

        return utils.absoluteLink(
          anchorHref.replace(/javascript:tryReadChapter\(\d+,'/gi, '').replace(/'\);/g, ''),
          VIZ.domain,
        );
      },
      elementEp(selector) {
        const anchorHref = selector.find('a').first().attr('href');

        if (
          !anchorHref ||
          /javascript:void\('join to read'\);/.test(anchorHref) ||
          anchorHref.includes('/read/manga/')
        )
          return NaN;

        let episodePart = selector.find('td.ch-num-list-spacing > div').text();

        if (episodePart.length === 0) {
          episodePart = selector.find('a').first().text().trim();
        }

        if (!episodePart || episodePart.length === 0) throw 'Join to read';

        const temp = episodePart.match(/\d+/gim);

        if (!temp) return NaN;

        return Number(temp[0]);
      },
    },
  },
  init(page) {
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );
    j.$(document).ready(function () {
      page.handlePage();
    });
  },
};
